import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

describe('VehiclesController', () => {
    let controller: VehiclesController;
    let vehiclesService: jest.Mocked<VehiclesService>;

    beforeEach(async () => {
        const mockVehiclesService = {
            searchByPlate: jest.fn(),
            getByPlate: jest.fn(),
            searchWithFilters: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [VehiclesController],
            providers: [
                {
                    provide: VehiclesService,
                    useValue: mockVehiclesService,
                },
            ],
        }).compile();

        controller = module.get<VehiclesController>(VehiclesController);
        vehiclesService = module.get(VehiclesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('search', () => {
        it('should return vehicles when search is successful', async () => {
            const mockVehicles = [
                {
                    id: 1,
                    licensePlate: '8689365',
                    manufacturer: 'פורד גרמניה',
                    commercialName: 'FOCUS',
                    year: 2009,
                },
            ];

            vehiclesService.searchByPlate.mockResolvedValue({
                success: true,
                vehicles: mockVehicles as any,
                total: 1,
            });

            const result = await controller.search({ plate: '8689365' });

            expect(result).toEqual({
                success: true,
                data: mockVehicles,
                total: 1,
            });
        });

        it('should throw BadRequestException when search fails', async () => {
            vehiclesService.searchByPlate.mockResolvedValue({
                success: false,
                vehicles: [],
                total: 0,
                error: 'Invalid license plate format. Must be 7-8 digits.',
            });

            await expect(controller.search({ plate: '123' })).rejects.toThrow(
                BadRequestException
            );
        });
    });

    describe('getByPlate', () => {
        it('should return vehicle when found', async () => {
            const mockVehicle = {
                id: 1,
                licensePlate: '8689365',
                manufacturer: 'פורד גרמניה',
                commercialName: 'FOCUS',
            };

            vehiclesService.getByPlate.mockResolvedValue(mockVehicle as any);

            const result = await controller.getByPlate('8689365');

            expect(result).toEqual({
                success: true,
                data: mockVehicle,
            });
        });

        it('should return not found message when vehicle not found', async () => {
            vehiclesService.getByPlate.mockResolvedValue(null);

            const result = await controller.getByPlate('9999999');

            expect(result).toEqual({
                success: false,
                message: 'Vehicle not found',
                data: null,
            });
        });

        it('should throw BadRequestException when plate is missing', async () => {
            await expect(controller.getByPlate('')).rejects.toThrow(
                BadRequestException
            );
        });
    });

    describe('searchWithFilters', () => {
        it('should return vehicles when filter search is successful', async () => {
            const mockVehicles = [
                {
                    id: 1,
                    licensePlate: '8689365',
                    manufacturer: 'פורד גרמניה',
                    commercialName: 'FOCUS',
                    year: 2009,
                },
                {
                    id: 2,
                    licensePlate: '1234567',
                    manufacturer: 'פורד גרמניה',
                    commercialName: 'FIESTA',
                    year: 2010,
                },
            ];

            vehiclesService.searchWithFilters.mockResolvedValue({
                success: true,
                vehicles: mockVehicles as any,
                total: 2,
            });

            const result = await controller.searchWithFilters({
                manufacturer: 'פורד',
                yearFrom: 2008,
                yearTo: 2012,
                limit: 20,
                offset: 0,
            });

            expect(result).toEqual({
                success: true,
                data: mockVehicles,
                total: 2,
            });
            expect(vehiclesService.searchWithFilters).toHaveBeenCalled();
        });

        it('should throw BadRequestException when filter search fails', async () => {
            vehiclesService.searchWithFilters.mockResolvedValue({
                success: false,
                vehicles: [],
                total: 0,
                error: 'API error',
            });

            await expect(
                controller.searchWithFilters({ manufacturer: 'test', limit: 20, offset: 0 })
            ).rejects.toThrow(BadRequestException);
        });

        it('should pass pagination options correctly', async () => {
            vehiclesService.searchWithFilters.mockResolvedValue({
                success: true,
                vehicles: [],
                total: 0,
            });

            await controller.searchWithFilters({
                manufacturer: 'פורד',
                limit: 50,
                offset: 100,
            });

            expect(vehiclesService.searchWithFilters).toHaveBeenCalledWith(
                expect.objectContaining({ manufacturer: 'פורד' }),
                expect.objectContaining({ limit: 50, offset: 100 })
            );
        });
    });
});
