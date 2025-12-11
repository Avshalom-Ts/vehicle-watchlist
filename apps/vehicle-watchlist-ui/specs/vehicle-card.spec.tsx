import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VehicleCard } from '../src/components/vehicle-card';
import type { Vehicle } from '../src/lib/vehicle-service';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Star: ({ className }: { className?: string }) => <span data-testid="star-icon" className={className}>Star</span>,
    Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
    Fuel: () => <span data-testid="fuel-icon">Fuel</span>,
    Palette: () => <span data-testid="palette-icon">Palette</span>,
    User: () => <span data-testid="user-icon">User</span>,
    Car: () => <span data-testid="car-icon">Car</span>,
    ExternalLink: () => <span data-testid="external-link-icon">ExternalLink</span>,
}));

describe('VehicleCard', () => {
    const mockVehicle: Vehicle = {
        id: 1,
        licensePlate: '8689365',
        manufacturer: 'פורד גרמניה',
        manufacturerCode: 10,
        model: 'DA3',
        modelCode: 100,
        modelType: 'P',
        commercialName: 'FOCUS',
        year: 2009,
        color: 'אפור מטל',
        colorCode: 5,
        fuelType: 'בנזין',
        ownership: 'פרטי',
        lastTestDate: '2025-02-11',
        validUntil: '2026-02-24',
        chassisNumber: 'WF0SXXGCDS9J40084',
        frontTire: '195/65R15',
        rearTire: '',
        engineModel: 'SHDA',
        trimLevel: 'TREND',
        pollutionGroup: 15,
        safetyLevel: null,
        registrationInstruction: null,
        firstOnRoad: '2009-2',
    };

    it('should render vehicle information', () => {
        render(<VehicleCard vehicle={mockVehicle} />);

        expect(screen.getByText('FOCUS')).toBeInTheDocument();
        expect(screen.getByText('פורד גרמניה')).toBeInTheDocument();
        expect(screen.getByText('8689365')).toBeInTheDocument();
        expect(screen.getByText('2009')).toBeInTheDocument();
    });

    it('should display model name when commercialName is not available', () => {
        const vehicleWithoutCommercialName = {
            ...mockVehicle,
            commercialName: '',
        };

        render(<VehicleCard vehicle={vehicleWithoutCommercialName} />);

        expect(screen.getByText('DA3')).toBeInTheDocument();
    });

    it('should display vehicle color', () => {
        render(<VehicleCard vehicle={mockVehicle} />);

        expect(screen.getByText('אפור מטל')).toBeInTheDocument();
    });

    it('should display fuel type', () => {
        render(<VehicleCard vehicle={mockVehicle} />);

        expect(screen.getByText('בנזין')).toBeInTheDocument();
    });

    it('should display ownership', () => {
        render(<VehicleCard vehicle={mockVehicle} />);

        expect(screen.getByText('פרטי')).toBeInTheDocument();
    });

    it('should display N/A for missing color', () => {
        const vehicleWithoutColor = { ...mockVehicle, color: '' };
        render(<VehicleCard vehicle={vehicleWithoutColor} />);

        expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    });

    it('should display valid until date', () => {
        render(<VehicleCard vehicle={mockVehicle} />);

        expect(screen.getByText(/Test valid until/)).toBeInTheDocument();
    });

    it('should show green color for valid test date', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const vehicleWithFutureDate = {
            ...mockVehicle,
            validUntil: futureDate.toISOString().split('T')[0],
        };

        render(<VehicleCard vehicle={vehicleWithFutureDate} />);

        const dateElement = screen.getByText((content, element) => {
            return element?.classList.contains('text-green-600') ?? false;
        });
        expect(dateElement).toBeInTheDocument();
    });

    it('should show destructive color for expired test date', () => {
        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 1);
        const vehicleWithPastDate = {
            ...mockVehicle,
            validUntil: pastDate.toISOString().split('T')[0],
        };

        render(<VehicleCard vehicle={vehicleWithPastDate} />);

        const dateElement = screen.getByText((content, element) => {
            return element?.classList.contains('text-destructive') ?? false;
        });
        expect(dateElement).toBeInTheDocument();
    });

    describe('onClick handler', () => {
        it('should call onClick when card is clicked', () => {
            const handleClick = jest.fn();
            render(<VehicleCard vehicle={mockVehicle} onClick={handleClick} />);

            // Click on the card (not on a button)
            const card = screen.getByText('FOCUS').closest('.hover\\:shadow-lg');
            fireEvent.click(card!);

            expect(handleClick).toHaveBeenCalledWith(mockVehicle);
        });

        it('should show external link icon when onClick is provided', () => {
            const handleClick = jest.fn();
            render(<VehicleCard vehicle={mockVehicle} onClick={handleClick} />);

            expect(screen.getByTestId('external-link-icon')).toBeInTheDocument();
        });

        it('should not show external link icon when onClick is not provided', () => {
            render(<VehicleCard vehicle={mockVehicle} />);

            expect(screen.queryByTestId('external-link-icon')).not.toBeInTheDocument();
        });
    });

    describe('Save to Watchlist button', () => {
        it('should render save button when onSave is provided', () => {
            const handleSave = jest.fn();
            render(<VehicleCard vehicle={mockVehicle} onSave={handleSave} />);

            expect(screen.getByText('Save to Watchlist')).toBeInTheDocument();
        });

        it('should call onSave when save button is clicked', () => {
            const handleSave = jest.fn();
            render(<VehicleCard vehicle={mockVehicle} onSave={handleSave} />);

            fireEvent.click(screen.getByText('Save to Watchlist'));

            expect(handleSave).toHaveBeenCalledWith(mockVehicle);
        });

        it('should show "In Watchlist" and be disabled when already saved', () => {
            const handleSave = jest.fn();
            render(
                <VehicleCard
                    vehicle={mockVehicle}
                    onSave={handleSave}
                    isInWatchlist={true}
                />
            );

            const button = screen.getByText('In Watchlist');
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
        });

        it('should not call onClick when save button is clicked', () => {
            const handleClick = jest.fn();
            const handleSave = jest.fn();
            render(
                <VehicleCard
                    vehicle={mockVehicle}
                    onClick={handleClick}
                    onSave={handleSave}
                />
            );

            fireEvent.click(screen.getByText('Save to Watchlist'));

            expect(handleSave).toHaveBeenCalled();
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('Star button', () => {
        it('should render star button when onStar is provided', () => {
            const handleStar = jest.fn();
            render(<VehicleCard vehicle={mockVehicle} onStar={handleStar} />);

            expect(screen.getByTestId('star-icon')).toBeInTheDocument();
        });

        it('should call onStar when star button is clicked', () => {
            const handleStar = jest.fn();
            render(<VehicleCard vehicle={mockVehicle} onStar={handleStar} />);

            fireEvent.click(screen.getByTitle('Star vehicle'));

            expect(handleStar).toHaveBeenCalledWith(mockVehicle);
        });

        it('should show filled star when isStarred is true', () => {
            const handleStar = jest.fn();
            render(
                <VehicleCard
                    vehicle={mockVehicle}
                    onStar={handleStar}
                    isStarred={true}
                />
            );

            const starIcon = screen.getByTestId('star-icon');
            expect(starIcon.className).toContain('fill-yellow-400');
        });

        it('should show "Remove star" title when starred', () => {
            const handleStar = jest.fn();
            render(
                <VehicleCard
                    vehicle={mockVehicle}
                    onStar={handleStar}
                    isStarred={true}
                />
            );

            expect(screen.getByTitle('Remove star')).toBeInTheDocument();
        });
    });

    it('should not render buttons when no handlers provided', () => {
        render(<VehicleCard vehicle={mockVehicle} />);

        expect(screen.queryByText('Save to Watchlist')).not.toBeInTheDocument();
        expect(screen.queryByText('In Watchlist')).not.toBeInTheDocument();
    });
});
