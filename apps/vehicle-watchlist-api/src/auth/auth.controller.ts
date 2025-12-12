import { Controller, Post, Get, Body, HttpCode, HttpStatus, UsePipes, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
    LoginDto,
    RegisterDto,
    AuthResponse,
    RefreshTokenDto,
    UserResponse,
    loginSchema,
    registerSchema,
    refreshTokenSchema
} from '@vehicle-watchlist/utils';
import { ZodValidationPipe } from '@vehicle-watchlist/utils';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RateLimitPresets } from '@vehicle-watchlist/rate-limit';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * Register a new user and generate JWT token
     * @param registerDto Data Transfer Object containing registration data
     * @returns AuthResponse containing JWT token and user info
     */
    @Post('register')
    @RateLimitPresets.Auth() // 5 requests per 15 minutes
    @UsePipes(new ZodValidationPipe(registerSchema))
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
        return this.authService.register(registerDto);
    }

    /**
     * Login a user and generate JWT token
     * @param loginDto Data Transfer Object containing login data
     * @returns AuthResponse containing JWT token and user info
     */
    @Post('login')
    @RateLimitPresets.Auth() // 5 requests per 15 minutes
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(loginSchema))
    async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
        return this.authService.login(loginDto);
    }

    /**
     * Refresh access token using refresh token
     * @param refreshTokenDto Data Transfer Object containing refresh token
     * @returns AuthResponse containing new tokens and user info
     */
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(refreshTokenSchema))
    async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
        return this.authService.refreshToken(refreshTokenDto);
    }

    /**
     * Logout current user (invalidate refresh token)
     * @param req Request object containing user info from JWT
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async logout(@Request() req: { user: { id: string; email: string; name: string } }): Promise<{ message: string }> {
        await this.authService.logout(req.user.id);
        return { message: 'Logged out successfully' };
    }

    /**
     * Get current user status/info
     * @param req Request object containing user info from JWT
     * @returns User information without sensitive data
     */
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getStatus(@Request() req: { user: { id: string; email: string; name: string } }): Promise<UserResponse> {
        return this.authService.getStatus(req.user.id);
    }

}
