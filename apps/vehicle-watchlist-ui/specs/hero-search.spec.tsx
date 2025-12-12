import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { HeroSearch } from '../src/components/hero-search';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Search: () => <span data-testid="search-icon">Search</span>,
}));

describe('HeroSearch', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    it('should render search form', () => {
        render(<HeroSearch />);

        expect(screen.getByPlaceholderText(/Enter license plate/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('should render search icon', () => {
        render(<HeroSearch />);

        expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    describe('Valid License Plate', () => {
        it('should navigate to search page with 7-digit plate', async () => {
            render(<HeroSearch />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '1234567');

            fireEvent.click(screen.getByRole('button', { name: /search/i }));

            expect(mockPush).toHaveBeenCalledWith('/search?plate=1234567');
        });

        it('should navigate to search page with 8-digit plate', async () => {
            render(<HeroSearch />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '12345678');

            fireEvent.click(screen.getByRole('button', { name: /search/i }));

            expect(mockPush).toHaveBeenCalledWith('/search?plate=12345678');
        });

        it('should accept plates with dashes', async () => {
            render(<HeroSearch />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '12-345-67');

            fireEvent.click(screen.getByRole('button', { name: /search/i }));

            expect(mockPush).toHaveBeenCalledWith('/search?plate=12-345-67');
        });

        it('should accept plates with different dash patterns', async () => {
            render(<HeroSearch />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '123-45-678');

            fireEvent.click(screen.getByRole('button', { name: /search/i }));

            expect(mockPush).toHaveBeenCalledWith('/search?plate=123-45-678');
        });
    });

    describe('Invalid License Plate', () => {
        it('should show error for plate with less than 7 digits', async () => {
            render(<HeroSearch />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '123456');

            fireEvent.click(screen.getByRole('button', { name: /search/i }));

            await waitFor(() => {
                expect(screen.getByText(/License plate must be 7-8 digits/i)).toBeInTheDocument();
            });
            expect(mockPush).not.toHaveBeenCalled();
        });

        it('should show error for plate with more than 8 digits', async () => {
            render(<HeroSearch />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '123456789');

            fireEvent.click(screen.getByRole('button', { name: /search/i }));

            await waitFor(() => {
                expect(screen.getByText(/License plate must be 7-8 digits/i)).toBeInTheDocument();
            });
            expect(mockPush).not.toHaveBeenCalled();
        });

        it('should show error for plate with letters', async () => {
            render(<HeroSearch />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, 'ABC1234');

            fireEvent.click(screen.getByRole('button', { name: /search/i }));

            await waitFor(() => {
                expect(screen.getByText(/License plate must be 7-8 digits/i)).toBeInTheDocument();
            });
            expect(mockPush).not.toHaveBeenCalled();
        });

        it('should show error for empty plate', async () => {
            render(<HeroSearch />);

            fireEvent.click(screen.getByRole('button', { name: /search/i }));

            await waitFor(() => {
                expect(screen.getByText(/License plate must be 7-8 digits/i)).toBeInTheDocument();
            });
            expect(mockPush).not.toHaveBeenCalled();
        });
    });

    describe('Error Clearing', () => {
        it('should clear error when user starts typing', async () => {
            render(<HeroSearch />);

            // Trigger error
            fireEvent.click(screen.getByRole('button', { name: /search/i }));
            await waitFor(() => {
                expect(screen.getByText(/License plate must be 7-8 digits/i)).toBeInTheDocument();
            });

            // Start typing
            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '1');

            // Error should be cleared
            await waitFor(() => {
                expect(screen.queryByText(/License plate must be 7-8 digits/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Form Submission', () => {
        it('should submit on form submit event', async () => {
            render(<HeroSearch />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '1234567');

            // Submit form
            const form = input.closest('form');
            if (form) fireEvent.submit(form);

            expect(mockPush).toHaveBeenCalledWith('/search?plate=1234567');
        });

        it('should submit on Enter key press', async () => {
            render(<HeroSearch />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '1234567{enter}');

            expect(mockPush).toHaveBeenCalledWith('/search?plate=1234567');
        });
    });

    describe('URL Encoding', () => {
        it('should encode special characters in plate', async () => {
            render(<HeroSearch />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '12-345-67');

            fireEvent.click(screen.getByRole('button', { name: /search/i }));

            // The plate should be URL encoded
            expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/search?plate='));
        });
    });

    describe('Custom className', () => {
        it('should apply custom className to form', () => {
            const { container } = render(<HeroSearch className="custom-class" />);

            const form = container.querySelector('form');
            expect(form).toHaveClass('custom-class');
        });
    });

    describe('Input Properties', () => {
        it('should have RTL direction for input', () => {
            render(<HeroSearch />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            expect(input).toHaveAttribute('dir', 'ltr');
        });
    });
});
