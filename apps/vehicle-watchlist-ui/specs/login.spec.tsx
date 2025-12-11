import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import LoginPage from '../src/app/login/page';
import { AuthService } from '../src/lib/auth-service';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../src/lib/auth-service', () => ({
    AuthService: {
        login: jest.fn(),
        isAuthenticated: jest.fn(),
    },
}));

describe('LoginPage', () => {
    const mockPush = jest.fn();
    const mockRouter = {
        push: mockPush,
    };
    const mockSearchParams = {
        get: jest.fn().mockReturnValue(null),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
        (AuthService.isAuthenticated as jest.Mock).mockReturnValue(false);
    });

    it('should render login form', async () => {
        render(<LoginPage />);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
        });
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should show validation error for invalid email', async () => {
        render(<LoginPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });

        const emailInput = screen.getByLabelText(/email/i);
        const form = screen.getByRole('button', { name: /sign in/i }).closest('form')!;

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
        });

        expect(AuthService.login).not.toHaveBeenCalled();
    });

    it('should show validation error for missing password', async () => {
        render(<LoginPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });

        const emailInput = screen.getByLabelText(/email/i);
        const form = screen.getByRole('button', { name: /sign in/i }).closest('form')!;

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });

        expect(AuthService.login).not.toHaveBeenCalled();
    });

    it('should submit form with valid credentials', async () => {
        const mockResponse = {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            user: {
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
            },
        };

        (AuthService.login as jest.Mock).mockResolvedValueOnce(mockResponse);

        render(<LoginPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(AuthService.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'Test1234',
            });
        });

        expect(toast.success).toHaveBeenCalledWith('Welcome back!');

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/dashboard');
        }, { timeout: 1500 });
    });

    it('should show error toast on login failure', async () => {
        (AuthService.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

        render(<LoginPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'WrongPassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
        });

        expect(mockPush).not.toHaveBeenCalled();
    });

    it('should disable form during submission', async () => {
        (AuthService.login as jest.Mock).mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve({ success: true, user: { email: 'test@example.com' } }), 100))
        );

        render(<LoginPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.click(submitButton);

        // Form should be disabled during submission
        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        });
    });

    it('should clear email error when user types', async () => {
        render(<LoginPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });

        const emailInput = screen.getByLabelText(/email/i);
        const form = screen.getByRole('button', { name: /sign in/i }).closest('form')!;

        // Trigger validation error
        fireEvent.change(emailInput, { target: { value: 'invalid' } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
        });

        // Clear error by typing
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        await waitFor(() => {
            expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument();
        });
    });

    it('should clear password error when user types', async () => {
        render(<LoginPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const form = screen.getByRole('button', { name: /sign in/i }).closest('form')!;

        // Set valid email
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        // Trigger validation error
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });

        // Clear error by typing
        fireEvent.change(passwordInput, { target: { value: 'password' } });

        await waitFor(() => {
            expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
        });
    });

    it('should have link to register page', async () => {
        render(<LoginPage />);

        await waitFor(() => {
            expect(screen.getByText(/sign up/i)).toBeInTheDocument();
        });

        const registerLink = screen.getByText(/sign up/i);
        expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
    });

    it('should handle generic error message', async () => {
        (AuthService.login as jest.Mock).mockRejectedValueOnce('Unknown error');

        render(<LoginPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Login failed. Please check your credentials.');
        });
    });
});
