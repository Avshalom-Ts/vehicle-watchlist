import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Navbar } from '../src/components/navbar';
import { AuthService } from '../src/lib/auth-service';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
    },
}));

jest.mock('../src/lib/auth-service', () => ({
    AuthService: {
        isAuthenticated: jest.fn(),
        getUser: jest.fn(),
        logout: jest.fn(),
    },
}));

describe('Navbar', () => {
    const mockPush = jest.fn();
    const mockRouter = {
        push: mockPush,
    };

    const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    it('should render navbar with brand', () => {
        (AuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

        render(<Navbar />);

        expect(screen.getByText('Vehicle Watchlist')).toBeInTheDocument();
    });

    describe('when not authenticated', () => {
        beforeEach(() => {
            (AuthService.isAuthenticated as jest.Mock).mockReturnValue(false);
        });

        it('should show login and register buttons', () => {
            render(<Navbar />);

            expect(screen.getByText('Login')).toBeInTheDocument();
            expect(screen.getByText('Register')).toBeInTheDocument();
        });

        it('should not show user info and logout button', () => {
            render(<Navbar />);

            expect(screen.queryByText('Test User')).not.toBeInTheDocument();
            expect(screen.queryByText('Logout')).not.toBeInTheDocument();
        });

        it('should have correct links for login and register', () => {
            render(<Navbar />);

            const loginLink = screen.getByText('Login').closest('a');
            const registerLink = screen.getByText('Register').closest('a');

            expect(loginLink).toHaveAttribute('href', '/login');
            expect(registerLink).toHaveAttribute('href', '/register');
        });
    });

    describe('when authenticated', () => {
        beforeEach(() => {
            (AuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
            (AuthService.getUser as jest.Mock).mockReturnValue(mockUser);
        });

        it('should show user name and logout button', () => {
            render(<Navbar />);

            expect(screen.getByText('Test User')).toBeInTheDocument();
            expect(screen.getByText('Logout')).toBeInTheDocument();
        });

        it('should not show login and register buttons', () => {
            render(<Navbar />);

            expect(screen.queryByText('Login')).not.toBeInTheDocument();
            expect(screen.queryByText('Register')).not.toBeInTheDocument();
        });

        it('should have link to dashboard with user name', () => {
            render(<Navbar />);

            const dashboardLink = screen.getByText('Test User').closest('a');
            expect(dashboardLink).toHaveAttribute('href', '/dashboard');
        });

        it('should logout when logout button is clicked', async () => {
            render(<Navbar />);

            const logoutButton = screen.getByText('Logout');
            fireEvent.click(logoutButton);

            await waitFor(() => {
                expect(AuthService.logout).toHaveBeenCalled();
                expect(toast.success).toHaveBeenCalledWith('Logged out successfully');
                expect(mockPush).toHaveBeenCalledWith('/');
            });
        });

        it('should update UI after logout', async () => {
            const { rerender } = render(<Navbar />);

            const logoutButton = screen.getByText('Logout');

            // Mock logout
            (AuthService.isAuthenticated as jest.Mock).mockReturnValue(false);
            (AuthService.getUser as jest.Mock).mockReturnValue(null);

            fireEvent.click(logoutButton);

            await waitFor(() => {
                expect(AuthService.logout).toHaveBeenCalled();
            });

            // Rerender to reflect state change
            rerender(<Navbar />);

            expect(screen.queryByText('Test User')).not.toBeInTheDocument();
            expect(screen.getByText('Login')).toBeInTheDocument();
        });
    });

    describe('storage event listener', () => {
        it('should add and remove storage event listener', () => {
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            (AuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

            const { unmount } = render(<Navbar />);

            expect(addEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));

            addEventListenerSpy.mockRestore();
            removeEventListenerSpy.mockRestore();
        });

        it('should update auth state on storage event', async () => {
            (AuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

            const { rerender } = render(<Navbar />);

            expect(screen.getByText('Login')).toBeInTheDocument();

            // Simulate login in another tab
            (AuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
            (AuthService.getUser as jest.Mock).mockReturnValue(mockUser);

            // Trigger storage event
            window.dispatchEvent(new Event('storage'));

            rerender(<Navbar />);

            await waitFor(() => {
                expect(screen.getByText('Test User')).toBeInTheDocument();
            });
        });
    });

    describe('theme toggle', () => {
        it('should render theme toggle button', () => {
            (AuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

            render(<Navbar />);

            // ThemeToggle component should be rendered
            // Exact text depends on implementation, but button should exist
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });
    });

    describe('navigation links', () => {
        it('should have link to home page', () => {
            (AuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

            render(<Navbar />);

            const homeLink = screen.getByText('Vehicle Watchlist').closest('a');
            expect(homeLink).toHaveAttribute('href', '/');
        });
    });

    describe('edge cases', () => {
        it('should handle null user gracefully', () => {
            (AuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
            (AuthService.getUser as jest.Mock).mockReturnValue(null);

            render(<Navbar />);

            // Should not crash, might show login buttons instead
            expect(screen.getByText('Vehicle Watchlist')).toBeInTheDocument();
        });

        it('should handle user with missing name', () => {
            (AuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
            (AuthService.getUser as jest.Mock).mockReturnValue({
                id: '123',
                email: 'test@example.com',
                name: '',
            });

            render(<Navbar />);

            // Should still render without crashing
            expect(screen.getByText('Vehicle Watchlist')).toBeInTheDocument();
        });
    });
});
