import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, AuthResponse, JwtPayload, RefreshTokenDto, UserResponse } from '@vehicle-watchlist/utils';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    /**
     * Validate user credentials
     * @param email User's email
     * @param password User's password
     * @returns The user object without password if valid, otherwise null
     */
    async validateUser(email: string, password: string): Promise<Omit<Record<string, unknown>, 'password'> | null> {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            return null;
        }

        const isPasswordValid = await this.usersService.validatePassword(
            password,
            user.password
        );

        if (isPasswordValid) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    /**
     * Login a user and generate JWT token
     * @param loginDto Data Transfer Object containing login data
     * @returns AuthResponse containing JWT token and user info
     * @throws UnauthorizedException if credentials are invalid or account is inactive
     */
    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(user['_id'].toString(), user['email'] as string, user['name'] as string);
        await this.usersService.updateRefreshToken(user['_id'].toString(), tokens.refresh_token);

        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            user: {
                id: user['_id'].toString(),
                email: user['email'] as string,
                name: user['name'] as string
            },
        };
    }

    /**
     * Register a new user and generate JWT token
     * @param registerDto Data Transfer Object containing registration data
     * @returns AuthResponse containing JWT token and user info
     * @throws UnauthorizedException if email already exists
     */
    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        const existingUser = await this.usersService.findOneByEmail(registerDto.email);

        if (existingUser) {
            throw new UnauthorizedException('Email already exists');
        }

        const user = await this.usersService.create(registerDto);

        const tokens = await this.generateTokens(user._id.toString(), user.email, user.name);
        await this.usersService.updateRefreshToken(user._id.toString(), tokens.refresh_token);

        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name
            },
        };
    }

    /**
     * Validate JWT token and return the corresponding user
     * @param payload The JWT payload
     * @returns The validated user object
     * @throws UnauthorizedException if the token is invalid or user is inactive
     */
    async validateToken(payload: JwtPayload) {
        const user = await this.usersService.findOneById(payload.sub);
        if (!user || !user.isActive) {
            throw new UnauthorizedException('Invalid token');
        }
        return user;
    }

    /**
     * Generate access and refresh tokens
     * @param userId User ID
     * @param email User email
     * @param name User name
     * @returns Object containing access_token and refresh_token
     */
    private async generateTokens(userId: string, email: string, name: string) {
        const payload: JwtPayload = { sub: userId, email, name };

        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: '1d', // Access token valid for 1 day
            }),
            this.jwtService.signAsync(payload, {
                expiresIn: '7d', // Refresh token valid for 7 days
            }),
        ]);

        return { access_token, refresh_token };
    }

    /**
     * Refresh access token using refresh token
     * @param refreshTokenDto Data Transfer Object containing refresh token
     * @returns AuthResponse containing new tokens and user info
     * @throws UnauthorizedException if refresh token is invalid
     */
    async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
        try {
            const payload = this.jwtService.verify<JwtPayload>(refreshTokenDto.refresh_token);
            const user = await this.usersService.findOneById(payload.sub);

            if (!user || !user.isActive || !user.refreshToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const isValidToken = await bcrypt.compare(refreshTokenDto.refresh_token, user.refreshToken);
            if (!isValidToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const tokens = await this.generateTokens(user._id.toString(), user.email, user.name);
            await this.usersService.updateRefreshToken(user._id.toString(), tokens.refresh_token);

            return {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                },
            };
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    /**
     * Logout user by removing refresh token
     * @param userId User ID
     */
    async logout(userId: string): Promise<void> {
        await this.usersService.updateRefreshToken(userId, null);
    }

    /**
     * Get current user status/info
     * @param userId User ID
     * @returns User information without sensitive data
     * @throws UnauthorizedException if user not found or inactive
     */
    async getStatus(userId: string): Promise<UserResponse> {
        const user = await this.usersService.findOneById(userId);
        if (!user || !user.isActive) {
            throw new UnauthorizedException('User not found or inactive');
        }

        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name
        };
    }
}
