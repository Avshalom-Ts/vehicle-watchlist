import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, RefreshTokenDto, JwtPayload } from '@vehicle-watchlist/utils';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;

    const mockUsersService = {
        findOneByEmail: jest.fn(),
        findOneById: jest.fn(),
        create: jest.fn(),
        validatePassword: jest.fn(),
        updateRefreshToken: jest.fn(),
    };

    const mockJwtService = {
        signAsync: jest.fn(),
        verify: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn(),
    };

    const mockUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        isActive: true,
        refreshToken: 'hashedRefreshToken',
        toObject: jest.fn().mockReturnValue({
            _id: '123',
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashedPassword',
            isActive: true,
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user without password if credentials are valid', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
            mockUsersService.validatePassword.mockResolvedValue(true);

            const result = await service.validateUser('test@example.com', 'Test1234');

            expect(result).toBeDefined();
            expect(result).not.toHaveProperty('password');
            expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith('test@example.com');
            expect(mockUsersService.validatePassword).toHaveBeenCalledWith('Test1234', 'hashedPassword');
        });

        it('should return null if user not found', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue(null);

            const result = await service.validateUser('test@example.com', 'Test1234');

            expect(result).toBeNull();
            expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith('test@example.com');
            expect(mockUsersService.validatePassword).not.toHaveBeenCalled();
        });

        it('should return null if password is invalid', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
            mockUsersService.validatePassword.mockResolvedValue(false);

            const result = await service.validateUser('test@example.com', 'WrongPassword');

            expect(result).toBeNull();
            expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith('test@example.com');
            expect(mockUsersService.validatePassword).toHaveBeenCalledWith('WrongPassword', 'hashedPassword');
        });
    });

    describe('login', () => {
        const loginDto: LoginDto = {
            email: 'test@example.com',
            password: 'Test1234',
        };

        it('should login user and return tokens', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
            mockUsersService.validatePassword.mockResolvedValue(true);
            mockJwtService.signAsync
                .mockResolvedValueOnce('access-token')
                .mockResolvedValueOnce('refresh-token');
            mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

            const result = await service.login(loginDto);

            expect(result).toHaveProperty('access_token', 'access-token');
            expect(result).toHaveProperty('refresh_token', 'refresh-token');
            expect(result.user).toEqual({
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
            });
            expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith('123', 'refresh-token');
        });

        it('should throw UnauthorizedException if credentials are invalid', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
        });
    });

    describe('register', () => {
        const registerDto: RegisterDto = {
            email: 'test@example.com',
            password: 'Test1234',
            name: 'Test User',
        };

        it('should register a new user and return tokens', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue(null);
            mockUsersService.create.mockResolvedValue(mockUser);
            mockJwtService.signAsync
                .mockResolvedValueOnce('access-token')
                .mockResolvedValueOnce('refresh-token');
            mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

            const result = await service.register(registerDto);

            expect(result).toHaveProperty('access_token', 'access-token');
            expect(result).toHaveProperty('refresh_token', 'refresh-token');
            expect(result.user).toEqual({
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
            });
            expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
            expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith('123', 'refresh-token');
        });

        it('should throw UnauthorizedException if email already exists', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

            await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.register(registerDto)).rejects.toThrow('Email already exists');
            expect(mockUsersService.create).not.toHaveBeenCalled();
        });
    });

    describe('validateToken', () => {
        const payload: JwtPayload = {
            sub: '123',
            email: 'test@example.com',
            name: 'Test User',
        };

        it('should return user if token is valid', async () => {
            mockUsersService.findOneById.mockResolvedValue(mockUser);

            const result = await service.validateToken(payload);

            expect(result).toEqual(mockUser);
            expect(mockUsersService.findOneById).toHaveBeenCalledWith('123');
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockUsersService.findOneById.mockResolvedValue(null);

            await expect(service.validateToken(payload)).rejects.toThrow(UnauthorizedException);
            await expect(service.validateToken(payload)).rejects.toThrow('Invalid token');
        });

        it('should throw UnauthorizedException if user is inactive', async () => {
            const inactiveUser = { ...mockUser, isActive: false };
            mockUsersService.findOneById.mockResolvedValue(inactiveUser);

            await expect(service.validateToken(payload)).rejects.toThrow(UnauthorizedException);
            await expect(service.validateToken(payload)).rejects.toThrow('Invalid token');
        });
    });

    describe('refreshToken', () => {
        const refreshTokenDto: RefreshTokenDto = {
            refresh_token: 'valid-refresh-token',
        };

        const payload: JwtPayload = {
            sub: '123',
            email: 'test@example.com',
            name: 'Test User',
        };

        it('should refresh tokens successfully', async () => {
            mockJwtService.verify.mockReturnValue(payload);
            mockUsersService.findOneById.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.signAsync
                .mockResolvedValueOnce('new-access-token')
                .mockResolvedValueOnce('new-refresh-token');
            mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

            const result = await service.refreshToken(refreshTokenDto);

            expect(result).toHaveProperty('access_token', 'new-access-token');
            expect(result).toHaveProperty('refresh_token', 'new-refresh-token');
            expect(result.user).toEqual({
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
            });
            expect(mockJwtService.verify).toHaveBeenCalledWith('valid-refresh-token');
            expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith('123', 'new-refresh-token');
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockJwtService.verify.mockReturnValue(payload);
            mockUsersService.findOneById.mockResolvedValue(null);

            await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow('Invalid refresh token');
        });

        it('should throw UnauthorizedException if user is inactive', async () => {
            const inactiveUser = { ...mockUser, isActive: false };
            mockJwtService.verify.mockReturnValue(payload);
            mockUsersService.findOneById.mockResolvedValue(inactiveUser);

            await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow('Invalid refresh token');
        });

        it('should throw UnauthorizedException if refresh token does not match', async () => {
            mockJwtService.verify.mockReturnValue(payload);
            mockUsersService.findOneById.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow('Invalid refresh token');
        });

        it('should throw UnauthorizedException if token verification fails', async () => {
            mockJwtService.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow('Invalid refresh token');
        });

        it('should throw UnauthorizedException if user has no refresh token', async () => {
            const userWithoutRefreshToken = { ...mockUser, refreshToken: null };
            mockJwtService.verify.mockReturnValue(payload);
            mockUsersService.findOneById.mockResolvedValue(userWithoutRefreshToken);

            await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow('Invalid refresh token');
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

            await service.logout('123');

            expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith('123', null);
        });
    });

    describe('getStatus', () => {
        it('should return user status successfully', async () => {
            mockUsersService.findOneById.mockResolvedValue(mockUser);

            const result = await service.getStatus('123');

            expect(result).toEqual({
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
            });
            expect(mockUsersService.findOneById).toHaveBeenCalledWith('123');
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockUsersService.findOneById.mockResolvedValue(null);

            await expect(service.getStatus('123')).rejects.toThrow(UnauthorizedException);
            await expect(service.getStatus('123')).rejects.toThrow('User not found or inactive');
        });

        it('should throw UnauthorizedException if user is inactive', async () => {
            const inactiveUser = { ...mockUser, isActive: false };
            mockUsersService.findOneById.mockResolvedValue(inactiveUser);

            await expect(service.getStatus('123')).rejects.toThrow(UnauthorizedException);
            await expect(service.getStatus('123')).rejects.toThrow('User not found or inactive');
        });
    });
});
