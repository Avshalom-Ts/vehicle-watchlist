import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;

    beforeEach(() => {
        guard = new JwtAuthGuard();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should call super.canActivate', () => {
            const mockContext = {} as ExecutionContext;
            const superCanActivateSpy = jest.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate');
            superCanActivateSpy.mockReturnValue(true);

            const result = guard.canActivate(mockContext);

            expect(result).toBe(true);
            expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);

            superCanActivateSpy.mockRestore();
        });
    });

    describe('handleRequest', () => {
        it('should return user if no error and user exists', () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
            };

            const result = guard.handleRequest(null, mockUser as Express.User);

            expect(result).toEqual(mockUser);
        });

        it('should throw UnauthorizedException if error exists', () => {
            const mockError = new Error('Token expired');
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
            };

            expect(() => guard.handleRequest(mockError, mockUser as Express.User)).toThrow(mockError);
        });

        it('should throw UnauthorizedException if user does not exist', () => {
            expect(() => guard.handleRequest(null, false)).toThrow(UnauthorizedException);
            expect(() => guard.handleRequest(null, false)).toThrow('Invalid or expired token');
        });

        it('should throw UnauthorizedException if both error and user are missing', () => {
            expect(() => guard.handleRequest(null, false)).toThrow(UnauthorizedException);
            expect(() => guard.handleRequest(null, false)).toThrow('Invalid or expired token');
        });

        it('should prioritize the error if both error and no user', () => {
            const mockError = new UnauthorizedException('Custom error');

            expect(() => guard.handleRequest(mockError, false)).toThrow(mockError);
        });

        it('should throw custom UnauthorizedException if no error but no user', () => {
            try {
                guard.handleRequest(null, false);
                fail('Expected to throw');
            } catch (error) {
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect((error as UnauthorizedException).message).toBe('Invalid or expired token');
            }
        });
    });
});
