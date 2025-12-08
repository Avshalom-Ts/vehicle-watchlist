import { z } from 'zod';

// User schema
export const userSchema = z.object({
    id: z.string(),
    email: z.email(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

// Registration schema
export const registerSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Login schema
export const loginSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// JWT payload schema
export const jwtPayloadSchema = z.object({
    sub: z.string(),
    email: z.email(),
    name: z.string(),
});

// Auth response schema
export const authResponseSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    user: userSchema.omit({ createdAt: true, updatedAt: true, password: true }),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
    refresh_token: z.string().min(1, 'Refresh token is required'),
});

// User response schema (without sensitive data)
export const userResponseSchema = userSchema.omit({ password: true, createdAt: true, updatedAt: true });

// Type exports
export type User = z.infer<typeof userSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
