import type { RegisterDto, LoginDto } from '@vehicle-watchlist/utils';

// Use relative URL so it works on any domain (localhost, CodeSandbox, production)
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiError {
    message: string;
    statusCode?: number;
    error?: string;
}

interface AuthResponseWithoutTokens {
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export class AuthService {
    private static async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error: ApiError = await response.json().catch(() => ({
                message: 'An error occurred',
            }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    static async register(data: RegisterDto): Promise<AuthResponseWithoutTokens> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important: send and receive cookies
            body: JSON.stringify(data),
        });

        const result = await this.handleResponse<AuthResponseWithoutTokens>(response);

        // Store user info in localStorage (tokens are in HTTP-only cookies)
        if (result.user) {
            localStorage.setItem('user', JSON.stringify(result.user));
        }

        return result;
    }

    static async login(data: LoginDto): Promise<AuthResponseWithoutTokens> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important: send and receive cookies
            body: JSON.stringify(data),
        });

        const result = await this.handleResponse<AuthResponseWithoutTokens>(response);

        // Store user info in localStorage (tokens are in HTTP-only cookies)
        if (result.user) {
            localStorage.setItem('user', JSON.stringify(result.user));
        }

        return result;
    }

    static async logout(): Promise<void> {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include', // Important: send cookies
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // Always clear local storage
            localStorage.removeItem('user');
        }
    }

    static getAccessToken(): string | null {
        // Tokens are in HTTP-only cookies, not accessible from JavaScript
        // This method is kept for backward compatibility but returns null
        return null;
    }

    static getUser(): { id: string; email: string; name: string } | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static isAuthenticated(): boolean {
        // Check if user info exists in localStorage
        // The actual JWT token is in HTTP-only cookies
        return !!this.getUser();
    }
}
