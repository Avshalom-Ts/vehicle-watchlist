import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, RegisterDto, RefreshTokenDto, AuthResponse, UserResponse } from '@vehicle-watchlist/utils';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        refreshToken: jest.fn(),
        logout: jest.fn(),
        getStatus: jest.fn(),
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
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
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

            const result = await controller.register(registerDto);

            expect(result).toEqual(mockAuthResponse);
            expect(authService.register).toHaveBeenCalledWith(registerDto);
            expect(authService.register).toHaveBeenCalledTimes(1);
        });

        it('should throw error if email already exists', async () => {
            const registerDto: RegisterDto = {
                email: 'test@example.com',
                password: 'Test1234',
                name: 'Test User',
            };

            mockAuthService.register.mockRejectedValue(new Error('Email already exists'));

            await expect(controller.register(registerDto)).rejects.toThrow('Email already exists');
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

            const result = await controller.login(loginDto);

            expect(result).toEqual(mockAuthResponse);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(authService.login).toHaveBeenCalledTimes(1);
        });

        it('should throw error if credentials are invalid', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'WrongPassword',
            };

            mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

            await expect(controller.login(loginDto)).rejects.toThrow('Invalid credentials');
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

            const result = await controller.logout(req);

            expect(result).toEqual({ message: 'Logged out successfully' });
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

            await expect(controller.logout(req)).rejects.toThrow('Logout failed');
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
