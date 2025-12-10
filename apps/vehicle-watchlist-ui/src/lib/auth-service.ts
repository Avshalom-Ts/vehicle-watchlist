import type { RegisterDto, LoginDto, AuthResponse } from '@vehicle-watchlist/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

interface ApiError {
    message: string;
    statusCode?: number;
    error?: string;
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

    static async register(data: RegisterDto): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await this.handleResponse<AuthResponse>(response);

        // Store tokens in localStorage
        if (result.access_token) {
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('refresh_token', result.refresh_token);
            localStorage.setItem('user', JSON.stringify(result.user));
        }

        return result;
    }

    static async login(data: LoginDto): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await this.handleResponse<AuthResponse>(response);

        // Store tokens in localStorage
        if (result.access_token) {
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('refresh_token', result.refresh_token);
            localStorage.setItem('user', JSON.stringify(result.user));
        }

        return result;
    }

    static logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }

    static getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    static getUser(): { id: string; email: string; name: string } | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }
}
