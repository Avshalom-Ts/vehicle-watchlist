import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchForm } from '../src/components/search-form';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Search: () => <span data-testid="search-icon">Search</span>,
    Loader2: ({ className }: { className?: string }) => (
        <span data-testid="loader-icon" className={className}>Loading</span>
    ),
    ChevronDown: () => <span data-testid="chevron-down">ChevronDown</span>,
    ChevronUp: () => <span data-testid="chevron-up">ChevronUp</span>,
    X: () => <span data-testid="x-icon">X</span>,
}));

// Mock the Select component from shadcn/ui
jest.mock('../src/components/ui/select', () => ({
    Select: ({ children, onValueChange, value, defaultValue }: {
        children: React.ReactNode;
        onValueChange?: (value: string) => void;
        value?: string;
        defaultValue?: string;
    }) => (
        <div data-testid="select" data-value={value || defaultValue}>
            {children}
        </div>
    ),
    SelectTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <button data-testid="select-trigger" className={className}>{children}</button>
    ),
    SelectValue: ({ placeholder }: { placeholder?: string }) => (
        <span data-testid="select-value">{placeholder}</span>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="select-content">{children}</div>
    ),
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
        <div data-testid={`select-item-${value}`}>{children}</div>
    ),
}));

// Mock the Collapsible component
jest.mock('../src/components/ui/collapsible', () => ({
    Collapsible: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CollapsibleTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
        <div>{children}</div>
    ),
    CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('SearchForm', () => {
    const mockOnSearch = jest.fn();
    const mockOnFilterSearch = jest.fn();

    // Helper to get the submit button (not the select trigger)
    const getSubmitButton = () => screen.getByRole('button', { name: /^search$/i }) || screen.getByRole('button', { type: 'submit' });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render search form', () => {
        render(<SearchForm onSearch={mockOnSearch} />);

        expect(screen.getByPlaceholderText(/Enter license plate/i)).toBeInTheDocument();
        // Use getAllByRole and find the submit button
        const buttons = screen.getAllByRole('button');
        const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit');
        expect(submitButton).toBeInTheDocument();
    });

    it('should render with initial plate value', () => {
        render(<SearchForm onSearch={mockOnSearch} initialPlate="8689365" />);

        const input = screen.getByDisplayValue('8689365');
        expect(input).toBeInTheDocument();
    });

    describe('License Plate Search', () => {
        it('should call onSearch with valid 7-digit plate', async () => {
            render(<SearchForm onSearch={mockOnSearch} />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '1234567');

            // Get the submit button by type
            const buttons = screen.getAllByRole('button');
            const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit');
            fireEvent.click(submitButton!);

            expect(mockOnSearch).toHaveBeenCalledWith('1234567');
        });

        it('should call onSearch with valid 8-digit plate', async () => {
            render(<SearchForm onSearch={mockOnSearch} />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '12345678');

            const buttons = screen.getAllByRole('button');
            const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit');
            fireEvent.click(submitButton!);

            expect(mockOnSearch).toHaveBeenCalledWith('12345678');
        });

        it('should accept plates with dashes', async () => {
            render(<SearchForm onSearch={mockOnSearch} />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '12-345-67');

            const buttons = screen.getAllByRole('button');
            const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit');
            fireEvent.click(submitButton!);

            expect(mockOnSearch).toHaveBeenCalledWith('12-345-67');
        });

        it('should show error for invalid plate (too short)', async () => {
            render(<SearchForm onSearch={mockOnSearch} />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '123456');

            const buttons = screen.getAllByRole('button');
            const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit');
            fireEvent.click(submitButton!);

            await waitFor(() => {
                expect(screen.getByText(/License plate must be 7-8 digits/i)).toBeInTheDocument();
            });
            expect(mockOnSearch).not.toHaveBeenCalled();
        });

        it('should show error for empty search', async () => {
            render(<SearchForm onSearch={mockOnSearch} />);

            const buttons = screen.getAllByRole('button');
            const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit');
            fireEvent.click(submitButton!);

            await waitFor(() => {
                expect(screen.getByText(/Please enter a search value/i)).toBeInTheDocument();
            });
            expect(mockOnSearch).not.toHaveBeenCalled();
        });
    });

    describe('Loading State', () => {
        it('should show loading spinner when isLoading is true', () => {
            render(<SearchForm onSearch={mockOnSearch} isLoading={true} />);

            expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
        });

        it('should disable search button when loading', () => {
            render(<SearchForm onSearch={mockOnSearch} isLoading={true} />);

            const buttons = screen.getAllByRole('button');
            const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit');
            expect(submitButton).toBeDisabled();
        });

        it('should show "Searching..." text when loading', () => {
            render(<SearchForm onSearch={mockOnSearch} isLoading={true} />);

            expect(screen.getByText(/Searching/i)).toBeInTheDocument();
        });
    });

    describe('Search Type Selection', () => {
        it('should render search type dropdown', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    onFilterSearch={mockOnFilterSearch}
                />
            );

            // Find the select trigger using testId
            const selectTrigger = screen.getByTestId('select-trigger');
            expect(selectTrigger).toBeInTheDocument();
        });
    });

    describe('Filter Search', () => {
        it('should have filter options available', () => {
            render(
                <SearchForm
                    onSearch={mockOnSearch}
                    onFilterSearch={mockOnFilterSearch}
                />
            );

            // Verify the select items are rendered
            expect(screen.getByTestId('select-item-manufacturer')).toBeInTheDocument();
            expect(screen.getByTestId('select-item-model')).toBeInTheDocument();
            expect(screen.getByTestId('select-item-color')).toBeInTheDocument();
        });
    });

    describe('Form Submission', () => {
        it('should submit on form submit event', async () => {
            render(<SearchForm onSearch={mockOnSearch} />);

            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '1234567');

            // Submit the form
            const form = input.closest('form');
            fireEvent.submit(form!);

            expect(mockOnSearch).toHaveBeenCalledWith('1234567');
        });
    });

    describe('Clear Error', () => {
        it('should clear error when user starts typing', async () => {
            render(<SearchForm onSearch={mockOnSearch} />);

            // Trigger error by submitting empty form
            const buttons = screen.getAllByRole('button');
            const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit');
            fireEvent.click(submitButton!);

            await waitFor(() => {
                expect(screen.getByText(/Please enter a search value/i)).toBeInTheDocument();
            });

            // Start typing
            const input = screen.getByPlaceholderText(/Enter license plate/i);
            await userEvent.type(input, '1');

            // Error should be cleared
            await waitFor(() => {
                expect(screen.queryByText(/Please enter a search value/i)).not.toBeInTheDocument();
            });
        });
    });
});
