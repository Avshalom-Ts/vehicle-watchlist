import { AuthService } from '../src/lib/auth-service';
import type { RegisterDto, LoginDto, AuthResponse } from '@vehicle-watchlist/utils';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('AuthService', () => {
    const mockAuthResponse: AuthResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
    });

    describe('register', () => {
        const registerDto: RegisterDto = {
            email: 'test@example.com',
            password: 'Test1234',
            name: 'Test User',
        };

        it('should register successfully and store user info', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockAuthResponse,
            });

            const result = await AuthService.register(registerDto);

            expect(result).toEqual(mockAuthResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/register'),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(registerDto),
                }
            );
            // Tokens are in HTTP-only cookies, only user info is stored
            expect(localStorageMock.getItem('user')).toBe(JSON.stringify(mockAuthResponse.user));
        });

        it('should throw error if registration fails', async () => {
            const errorResponse = {
                message: 'Email already exists',
                statusCode: 401,
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => errorResponse,
            });

            await expect(AuthService.register(registerDto)).rejects.toThrow('Email already exists');
            expect(localStorageMock.getItem('user')).toBeNull();
        });

        it('should handle network errors', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            await expect(AuthService.register(registerDto)).rejects.toThrow('Network error');
        });

        it('should handle malformed error response', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => {
                    throw new Error('Invalid JSON');
                },
            });

            await expect(AuthService.register(registerDto)).rejects.toThrow();
        });

        it('should reject registration with disposable email', async () => {
            const disposableDto: RegisterDto = {
                email: 'test@10minutemail.com',
                password: 'Test1234',
                name: 'Test User',
            };

            const errorResponse = {
                message: 'Disposable email addresses are not allowed',
                statusCode: 400,
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => errorResponse,
            });

            await expect(AuthService.register(disposableDto)).rejects.toThrow(
                'Disposable email addresses are not allowed'
            );
            expect(localStorageMock.getItem('access_token')).toBeNull();
        });

        it('should accept registration with valid email provider', async () => {
            const validDto: RegisterDto = {
                email: 'user@gmail.com',
                password: 'Test1234',
                name: 'Test User',
            };

            const validResponse = {
                ...mockAuthResponse,
                user: {
                    ...mockAuthResponse.user,
                    email: 'user@gmail.com',
                },
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => validResponse,
            });

            const result = await AuthService.register(validDto);

            expect(result).toEqual(validResponse);
            // Tokens are in HTTP-only cookies, only user info is stored
            expect(localStorageMock.getItem('user')).toBe(JSON.stringify(validResponse.user));
        });
    });

    describe('login', () => {
        const loginDto: LoginDto = {
            email: 'test@example.com',
            password: 'Test1234',
        };

        it('should login successfully and store user info', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockAuthResponse,
            });

            const result = await AuthService.login(loginDto);

            expect(result).toEqual(mockAuthResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/login'),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(loginDto),
                }
            );
            // Tokens are in HTTP-only cookies, only user info is stored
            expect(localStorageMock.getItem('user')).toBe(JSON.stringify(mockAuthResponse.user));
        });

        it('should throw error if credentials are invalid', async () => {
            const errorResponse = {
                message: 'Invalid credentials',
                statusCode: 401,
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => errorResponse,
            });

            await expect(AuthService.login(loginDto)).rejects.toThrow('Invalid credentials');
            expect(localStorageMock.getItem('access_token')).toBeNull();
        });

        it('should handle server errors', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({
                    message: 'Internal server error',
                }),
            });

            await expect(AuthService.login(loginDto)).rejects.toThrow('Internal server error');
        });
    });

    describe('logout', () => {
        it('should clear user info from localStorage', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({}),
            });

            localStorageMock.setItem('user', JSON.stringify(mockAuthResponse.user));

            await AuthService.logout();

            // Only user info is cleared, tokens are in HTTP-only cookies
            expect(localStorageMock.getItem('user')).toBeNull();
        });

        it('should work even if no user info exists', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({}),
            });

            await expect(AuthService.logout()).resolves.not.toThrow();
        });
    });

    describe('getAccessToken', () => {
        it('should return null (tokens are in HTTP-only cookies)', () => {
            const token = AuthService.getAccessToken();

            expect(token).toBeNull();
        });
    });

    describe('getUser', () => {
        it('should return parsed user object if it exists', () => {
            localStorageMock.setItem('user', JSON.stringify(mockAuthResponse.user));

            const user = AuthService.getUser();

            expect(user).toEqual(mockAuthResponse.user);
        });

        it('should return null if no user exists', () => {
            const user = AuthService.getUser();

            expect(user).toBeNull();
        });

        it('should handle invalid JSON gracefully', () => {
            localStorageMock.setItem('user', 'invalid-json');

            expect(() => AuthService.getUser()).toThrow();
        });
    });

    describe('isAuthenticated', () => {
        it('should return true if user info exists in localStorage', () => {
            localStorageMock.setItem('user', JSON.stringify({ id: '1', email: 'test@test.com', name: 'Test' }));

            expect(AuthService.isAuthenticated()).toBe(true);
        });

        it('should return false if no user info exists', () => {
            expect(AuthService.isAuthenticated()).toBe(false);
        });

        it('should return false if user info is empty', () => {
            localStorageMock.setItem('user', '');

            expect(AuthService.isAuthenticated()).toBe(false);
        });
    });
});
