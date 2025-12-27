import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import RegisterPage from '../src/app/register/page';
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
        register: jest.fn(),
        isAuthenticated: jest.fn(),
    },
}));

describe('RegisterPage', () => {
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

    it('should render registration form', async () => {
        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
        });
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should show validation error for short name', async () => {
        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const form = screen.getByRole('button', { name: /sign up/i }).closest('form')!;

        fireEvent.change(nameInput, { target: { value: 'A' } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
        });

        expect(AuthService.register).not.toHaveBeenCalled();
    });

    it('should show validation error for invalid email', async () => {
        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const form = screen.getByRole('button', { name: /sign up/i }).closest('form')!;

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
        });

        expect(AuthService.register).not.toHaveBeenCalled();
    });

    it('should show error for disposable email addresses', async () => {
        (AuthService.register as jest.Mock).mockRejectedValueOnce(
            new Error('Disposable email addresses are not allowed')
        );

        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@10minutemail.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Test1234' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(AuthService.register).toHaveBeenCalledWith({
                name: 'Test User',
                email: 'test@10minutemail.com',
                password: 'Test1234',
            });
        });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Disposable email addresses are not allowed');
        });

        expect(mockPush).not.toHaveBeenCalled();
    });

    it('should accept valid email from legitimate provider', async () => {
        const mockResponse = {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            user: {
                id: '123',
                email: 'user@gmail.com',
                name: 'Test User',
            },
        };

        (AuthService.register as jest.Mock).mockResolvedValueOnce(mockResponse);

        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'user@gmail.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Test1234' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(AuthService.register).toHaveBeenCalledWith({
                name: 'Test User',
                email: 'user@gmail.com',
                password: 'Test1234',
            });
        });

        expect(toast.success).toHaveBeenCalledWith('Account created successfully!');

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/dashboard');
        }, { timeout: 1500 });
    });

    it('should show validation error for short password', async () => {
        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const form = screen.getByRole('button', { name: /sign up/i }).closest('form')!;

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
        });

        expect(AuthService.register).not.toHaveBeenCalled();
    });

    it('should show validation error for password without uppercase', async () => {
        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const form = screen.getByRole('button', { name: /sign up/i }).closest('form')!;

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'test1234' } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument();
        });

        expect(AuthService.register).not.toHaveBeenCalled();
    });

    it('should show validation error for password without lowercase', async () => {
        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const form = screen.getByRole('button', { name: /sign up/i }).closest('form')!;

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'TEST1234' } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/password must contain at least one lowercase letter/i)).toBeInTheDocument();
        });

        expect(AuthService.register).not.toHaveBeenCalled();
    });

    it('should show validation error for password without number', async () => {
        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const form = screen.getByRole('button', { name: /sign up/i }).closest('form')!;

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'TestTest' } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/password must contain at least one number/i)).toBeInTheDocument();
        });

        expect(AuthService.register).not.toHaveBeenCalled();
    });

    it('should show validation error for mismatched passwords', async () => {
        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const form = screen.getByRole('button', { name: /sign up/i }).closest('form')!;

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Test5678' } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        });

        expect(AuthService.register).not.toHaveBeenCalled();
    });

    it('should submit form with valid data', async () => {
        const mockResponse = {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            user: {
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
            },
        };

        (AuthService.register as jest.Mock).mockResolvedValueOnce(mockResponse);

        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Test1234' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(AuthService.register).toHaveBeenCalledWith({
                name: 'Test User',
                email: 'test@example.com',
                password: 'Test1234',
            });
        });

        expect(toast.success).toHaveBeenCalledWith('Account created successfully!');

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/dashboard');
        }, { timeout: 1500 });
    });

    it('should show error toast on registration failure', async () => {
        (AuthService.register as jest.Mock).mockRejectedValueOnce(new Error('Email already exists'));

        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Test1234' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Email already exists');
        });

        expect(mockPush).not.toHaveBeenCalled();
    });

    it('should disable form during submission', async () => {
        (AuthService.register as jest.Mock).mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve({ success: true, user: { email: 'test@example.com' } }), 100))
        );

        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Test1234' } });
        fireEvent.click(submitButton);

        // Form should be disabled during submission
        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        });
    });

    it('should have link to login page', async () => {
        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByText(/sign in/i)).toBeInTheDocument();
        });

        const loginLink = screen.getByText(/sign in/i);
        expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('should clear field errors when user types', async () => {
        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const form = screen.getByRole('button', { name: /sign up/i }).closest('form')!;

        // Trigger validation error
        fireEvent.change(nameInput, { target: { value: 'A' } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
        });

        // Clear error by typing
        fireEvent.change(nameInput, { target: { value: 'Test User' } });

        await waitFor(() => {
            expect(screen.queryByText(/name must be at least 2 characters/i)).not.toBeInTheDocument();
        });
    });

    it('should handle generic error message', async () => {
        (AuthService.register as jest.Mock).mockRejectedValueOnce('Unknown error');

        render(<RegisterPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Test1234' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Registration failed. Please try again.');
        });
    });
});

