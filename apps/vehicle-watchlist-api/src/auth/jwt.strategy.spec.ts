import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { JwtPayload } from '@vehicle-watchlist/utils';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let authService: AuthService;

    const mockAuthService = {
        validateToken: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn().mockReturnValue('test-secret-key'),
    };

    const mockUser = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    describe('validate', () => {
        const payload: JwtPayload = {
            sub: '123',
            email: 'test@example.com',
            name: 'Test User',
        };

        it('should validate and return user', async () => {
            mockAuthService.validateToken.mockResolvedValue(mockUser);

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
            });
            expect(authService.validateToken).toHaveBeenCalledWith(payload);
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockAuthService.validateToken.mockResolvedValue(null);

            await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
            expect(authService.validateToken).toHaveBeenCalledWith(payload);
        });

        it('should throw UnauthorizedException if validateToken throws', async () => {
            mockAuthService.validateToken.mockRejectedValue(new UnauthorizedException('Invalid token'));

            await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
            expect(authService.validateToken).toHaveBeenCalledWith(payload);
        });
    });

    describe('constructor', () => {
        it('should initialize with JWT_SECRET from config', () => {
            expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
        });

        it('should use default secret if JWT_SECRET is not provided', async () => {
            const mockConfigWithoutSecret = {
                get: jest.fn().mockReturnValue(undefined),
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    JwtStrategy,
                    {
                        provide: AuthService,
                        useValue: mockAuthService,
                    },
                    {
                        provide: ConfigService,
                        useValue: mockConfigWithoutSecret,
                    },
                ],
            }).compile();

            const newStrategy = module.get<JwtStrategy>(JwtStrategy);
            expect(newStrategy).toBeDefined();
        });
    });
});
