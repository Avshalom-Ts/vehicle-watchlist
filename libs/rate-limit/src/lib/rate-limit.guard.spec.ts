import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit.guard';
import { MemoryRateLimitStorage } from './rate-limit.storage';
import { RATE_LIMIT_OPTIONS, RATE_LIMIT_STORAGE } from './rate-limit.constants';

describe('RateLimitGuard', () => {
    let guard: RateLimitGuard;
    let storage: MemoryRateLimitStorage;
    let reflector: Reflector;

    beforeEach(async () => {
        storage = new MemoryRateLimitStorage();
        reflector = new Reflector();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RateLimitGuard,
                {
                    provide: RATE_LIMIT_OPTIONS,
                    useValue: { windowSec: 60, max: 5 },
                },
                {
                    provide: RATE_LIMIT_STORAGE,
                    useValue: storage,
                },
                {
                    provide: Reflector,
                    useValue: reflector,
                },
            ],
        }).compile();

        guard = module.get<RateLimitGuard>(RateLimitGuard);
    });

    afterEach(async () => {
        await storage.clear();
    });

    const createMockContext = (ip = '127.0.0.1'): ExecutionContext => {
        const mockRequest = {
            ip,
            route: { path: '/test' },
            path: '/test',
            headers: {},
            socket: {},
        };

        const mockResponse = {
            setHeader: jest.fn(),
        };

        return {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
                getResponse: () => mockResponse,
                getNext: jest.fn(),
            }),
            getHandler: jest.fn(),
            getClass: jest.fn(),
            getArgs: jest.fn(),
            getArgByIndex: jest.fn(),
            switchToRpc: jest.fn(),
            switchToWs: jest.fn(),
            getType: jest.fn(),
        } as ExecutionContext;
    };

    it('should allow requests within rate limit', async () => {
        const context = createMockContext();
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

        for (let i = 0; i < 5; i++) {
            const result = await guard.canActivate(context);
            expect(result).toBe(true);
        }
    });

    it('should block requests exceeding rate limit', async () => {
        const context = createMockContext();
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

        // Make 5 allowed requests
        for (let i = 0; i < 5; i++) {
            await guard.canActivate(context);
        }

        // 6th request should be blocked
        await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
    });

    it('should skip rate limiting when explicitly disabled', async () => {
        const context = createMockContext();
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

        // Should allow unlimited requests
        for (let i = 0; i < 100; i++) {
            const result = await guard.canActivate(context);
            expect(result).toBe(true);
        }
    });

    it('should apply route-specific options', async () => {
        const context = createMockContext();
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({ max: 2 });

        // Should allow 2 requests
        await guard.canActivate(context);
        await guard.canActivate(context);

        // 3rd request should be blocked
        await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
    });

    it('should set rate limit headers', async () => {
        const context = createMockContext();
        const response = context.switchToHttp().getResponse();
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

        await guard.canActivate(context);

        expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
        expect(response.setHeader).toHaveBeenCalledWith(
            'X-RateLimit-Remaining',
            4
        );
        expect(response.setHeader).toHaveBeenCalledWith(
            'X-RateLimit-Reset',
            expect.any(Number)
        );
    });

    it('should use different keys for different IPs', async () => {
        const context1 = createMockContext('192.168.1.1');
        const context2 = createMockContext('192.168.1.2');
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

        // Each IP should have its own limit
        for (let i = 0; i < 5; i++) {
            await guard.canActivate(context1);
            await guard.canActivate(context2);
        }

        // Both should be blocked at their 6th request
        await expect(guard.canActivate(context1)).rejects.toThrow(HttpException);
        await expect(guard.canActivate(context2)).rejects.toThrow(HttpException);
    });
});
