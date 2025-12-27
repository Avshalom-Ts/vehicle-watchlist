import { Controller, Post, Get, Body, HttpCode, HttpStatus, UsePipes, UseGuards, Request, Response } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
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
import { ValidateEmail, EmailValidationGuard } from '@vehicle-watchlist/email-validation';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * Register a new user and generate JWT token
     * @param registerDto Data Transfer Object containing registration data
     * @returns AuthResponse containing JWT token and user info
     */
    @Post('register')
    @UseGuards(EmailValidationGuard)
    @ValidateEmail({ blockDisposable: true })
    @RateLimitPresets.Auth() // 5 requests per 15 minutes
    @UsePipes(new ZodValidationPipe(registerSchema))
    async register(@Body() registerDto: RegisterDto, @Response() res: ExpressResponse) {
        const result = await this.authService.register(registerDto);

        // Set HTTP-only cookies
        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refresh_token', result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Return full response including tokens (for e2e tests)
        return res.json(result);
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
    async login(@Body() loginDto: LoginDto, @Response() res: ExpressResponse) {
        const result = await this.authService.login(loginDto);

        // Set HTTP-only cookies
        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refresh_token', result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Return only user info, tokens are in cookies
        return res.json({ user: result.user });
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
    async logout(@Request() req: { user: { id: string; email: string; name: string } }, @Response() res: ExpressResponse) {
        await this.authService.logout(req.user.id);

        // Clear cookies
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        return res.json({ message: 'Logged out successfully' });
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
