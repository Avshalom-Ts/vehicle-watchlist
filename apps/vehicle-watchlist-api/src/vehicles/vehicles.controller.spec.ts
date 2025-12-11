import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

describe('VehiclesController', () => {
    let controller: VehiclesController;
    let vehiclesService: jest.Mocked<VehiclesService>;

    beforeEach(async () => {
        const mockVehiclesService = {
            searchByPlate: jest.fn(),
            searchWithFilters: jest.fn(),
            getExtendedDetails: jest.fn(),
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

    describe('getExtendedDetails', () => {
        it('should return extended details when found', async () => {
            const mockDetails = {
                id: 1,
                licensePlate: '8689365',
                manufacturerCode: 10,
                modelCode: 100,
                modelType: 'P',
                frontTireLoadCode: 91,
                rearTireLoadCode: 91,
                frontTireSpeedCode: 'H',
                rearTireSpeedCode: 'H',
                towingInfo: null,
            };

            vehiclesService.getExtendedDetails.mockResolvedValue({
                success: true,
                details: mockDetails as any,
            });

            const result = await controller.getExtendedDetails('8689365');

            expect(result).toEqual({
                success: true,
                data: mockDetails,
            });
        });

        it('should throw NotFoundException when vehicle not found', async () => {
            vehiclesService.getExtendedDetails.mockResolvedValue({
                success: true,
                details: null,
            });

            await expect(controller.getExtendedDetails('9999999')).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw BadRequestException when request fails', async () => {
            vehiclesService.getExtendedDetails.mockResolvedValue({
                success: false,
                details: null,
                error: 'API error',
            });

            await expect(controller.getExtendedDetails('8689365')).rejects.toThrow(
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
                page: 1,
            });

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockVehicles);
            expect(result.total).toBe(2);
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
                controller.searchWithFilters({ manufacturer: 'test', limit: 20, page: 1 })
            ).rejects.toThrow(BadRequestException);
        });

        it('should pass pagination options correctly', async () => {
            vehiclesService.searchWithFilters.mockResolvedValue({
                success: true,
                vehicles: [],
                total: 0,
            });

            // page 3 with limit 50 should result in offset 100 (page-1)*limit
            await controller.searchWithFilters({
                manufacturer: 'פורד',
                limit: 50,
                page: 3,
            });

            expect(vehiclesService.searchWithFilters).toHaveBeenCalledWith(
                expect.objectContaining({ manufacturer: 'פורד' }),
                expect.objectContaining({ limit: 50, offset: 100 })
            );
        });

        it('should return pagination info in response', async () => {
            vehiclesService.searchWithFilters.mockResolvedValue({
                success: true,
                vehicles: [],
                total: 100,
            });

            const result = await controller.searchWithFilters({
                manufacturer: 'פורד',
                limit: 25,
                page: 2,
            });

            expect(result.pagination).toEqual({
                page: 2,
                limit: 25,
                totalPages: 4,
                hasNextPage: true,
                hasPrevPage: true,
            });
        });
    });
});
