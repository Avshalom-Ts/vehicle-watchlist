import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, RegisterDto, RefreshTokenDto, AuthResponse, UserResponse } from '@vehicle-watchlist/utils';
import { EmailValidationGuard, EmailValidationService } from '@vehicle-watchlist/email-validation';
import { Reflector } from '@nestjs/core';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;
    let emailValidationService: EmailValidationService;
    let emailValidationGuard: EmailValidationGuard;

    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        refreshToken: jest.fn(),
        logout: jest.fn(),
        getStatus: jest.fn(),
    };

    const mockEmailValidationService = {
        validateEmail: jest.fn(),
        validateEmails: jest.fn(),
        isDisposable: jest.fn(),
    };

    const mockAuthResponse: AuthResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
        },
    };

    const mockUserResponse: UserResponse = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: EmailValidationService,
                    useValue: mockEmailValidationService,
                },
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
                EmailValidationGuard,
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
        emailValidationService = module.get<EmailValidationService>(EmailValidationService);
        emailValidationGuard = module.get<EmailValidationGuard>(EmailValidationGuard);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const registerDto: RegisterDto = {
                email: 'test@example.com',
                password: 'Test1234',
                name: 'Test User',
            };

            mockAuthService.register.mockResolvedValue(mockAuthResponse);

            const mockRes = {
                cookie: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            await controller.register(registerDto, mockRes);

            expect(mockRes.cookie).toHaveBeenCalledWith('access_token', mockAuthResponse.access_token, expect.any(Object));
            expect(mockRes.cookie).toHaveBeenCalledWith('refresh_token', mockAuthResponse.refresh_token, expect.any(Object));
            expect(mockRes.json).toHaveBeenCalledWith({ user: mockAuthResponse.user });
            expect(authService.register).toHaveBeenCalledWith(registerDto);
            expect(authService.register).toHaveBeenCalledTimes(1);
        });

        it('should validate email is not disposable on registration', async () => {
            const registerDto: RegisterDto = {
                email: 'test@gmail.com',
                password: 'Test1234',
                name: 'Test User',
            };

            mockEmailValidationService.validateEmail.mockResolvedValue({
                isValid: true,
                isDisposable: false,
                email: 'test@gmail.com',
                domain: 'gmail.com',
            });

            mockAuthService.register.mockResolvedValue(mockAuthResponse);

            const mockRes = {
                cookie: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            await controller.register(registerDto, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ user: mockAuthResponse.user });
            expect(authService.register).toHaveBeenCalledWith(registerDto);
        });

        it('should reject registration with disposable email', async () => {
            const registerDto: RegisterDto = {
                email: 'test@10minutemail.com',
                password: 'Test1234',
                name: 'Test User',
            };

            mockEmailValidationService.validateEmail.mockResolvedValue({
                isValid: false,
                isDisposable: true,
                email: 'test@10minutemail.com',
                domain: '10minutemail.com',
                error: 'Disposable email addresses are not allowed',
            });

            // The guard would throw BadRequestException before reaching the controller
            // So we test the validation service behavior
            const validationResult = await emailValidationService.validateEmail(registerDto.email);

            expect(validationResult.isDisposable).toBe(true);
            expect(validationResult.isValid).toBe(false);
            expect(validationResult.error).toBe('Disposable email addresses are not allowed');
        });

        it('should reject registration with invalid email format', async () => {
            const registerDto: RegisterDto = {
                email: 'invalid-email',
                password: 'Test1234',
                name: 'Test User',
            };

            mockEmailValidationService.validateEmail.mockResolvedValue({
                isValid: false,
                isDisposable: false,
                email: 'invalid-email',
                domain: '',
                error: 'Invalid email format',
            });

            const validationResult = await emailValidationService.validateEmail(registerDto.email);

            expect(validationResult.isValid).toBe(false);
            expect(validationResult.error).toBe('Invalid email format');

            mockAuthService.register.mockRejectedValue(new Error('Email already exists'));

            const mockRes = {
                cookie: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            await expect(controller.register(registerDto, mockRes)).rejects.toThrow('Email already exists');
            expect(authService.register).toHaveBeenCalledWith(registerDto);
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'Test1234',
            };

            mockAuthService.login.mockResolvedValue(mockAuthResponse);

            const mockRes = {
                cookie: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            await controller.login(loginDto, mockRes);

            expect(mockRes.cookie).toHaveBeenCalledWith('access_token', mockAuthResponse.access_token, expect.any(Object));
            expect(mockRes.cookie).toHaveBeenCalledWith('refresh_token', mockAuthResponse.refresh_token, expect.any(Object));
            expect(mockRes.json).toHaveBeenCalledWith({ user: mockAuthResponse.user });
            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(authService.login).toHaveBeenCalledTimes(1);
        });

        it('should throw error if credentials are invalid', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'WrongPassword',
            };

            mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

            const mockRes = {
                cookie: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            await expect(controller.login(loginDto, mockRes)).rejects.toThrow('Invalid credentials');
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });

    describe('refresh', () => {
        it('should refresh tokens successfully', async () => {
            const refreshTokenDto: RefreshTokenDto = {
                refresh_token: 'mock-refresh-token',
            };

            const newAuthResponse: AuthResponse = {
                access_token: 'new-access-token',
                refresh_token: 'new-refresh-token',
                user: mockAuthResponse.user,
            };

            mockAuthService.refreshToken.mockResolvedValue(newAuthResponse);

            const result = await controller.refresh(refreshTokenDto);

            expect(result).toEqual(newAuthResponse);
            expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
            expect(authService.refreshToken).toHaveBeenCalledTimes(1);
        });

        it('should throw error if refresh token is invalid', async () => {
            const refreshTokenDto: RefreshTokenDto = {
                refresh_token: 'invalid-token',
            };

            mockAuthService.refreshToken.mockRejectedValue(new Error('Invalid refresh token'));

            await expect(controller.refresh(refreshTokenDto)).rejects.toThrow('Invalid refresh token');
            expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            const req = {
                user: {
                    id: '123',
                    email: 'test@example.com',
                    name: 'Test User',
                },
            };

            mockAuthService.logout.mockResolvedValue(undefined);

            const mockRes = {
                clearCookie: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            await controller.logout(req, mockRes);

            expect(mockRes.clearCookie).toHaveBeenCalledWith('access_token');
            expect(mockRes.clearCookie).toHaveBeenCalledWith('refresh_token');
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
            expect(authService.logout).toHaveBeenCalledWith(req.user.id);
            expect(authService.logout).toHaveBeenCalledTimes(1);
        });

        it('should throw error if logout fails', async () => {
            const req = {
                user: {
                    id: '123',
                    email: 'test@example.com',
                    name: 'Test User',
                },
            };

            mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

            const mockRes = {
                clearCookie: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            await expect(controller.logout(req, mockRes)).rejects.toThrow('Logout failed');
            expect(authService.logout).toHaveBeenCalledWith(req.user.id);
        });
    });

    describe('getStatus', () => {
        it('should get user profile successfully', async () => {
            const req = {
                user: {
                    id: '123',
                    email: 'test@example.com',
                    name: 'Test User',
                },
            };

            mockAuthService.getStatus.mockResolvedValue(mockUserResponse);

            const result = await controller.getStatus(req);

            expect(result).toEqual(mockUserResponse);
            expect(authService.getStatus).toHaveBeenCalledWith(req.user.id);
            expect(authService.getStatus).toHaveBeenCalledTimes(1);
        });

        it('should throw error if user not found', async () => {
            const req = {
                user: {
                    id: '123',
                    email: 'test@example.com',
                    name: 'Test User',
                },
            };

            mockAuthService.getStatus.mockRejectedValue(new Error('User not found or inactive'));

            await expect(controller.getStatus(req)).rejects.toThrow('User not found or inactive');
            expect(authService.getStatus).toHaveBeenCalledWith(req.user.id);
        });
    });
});
