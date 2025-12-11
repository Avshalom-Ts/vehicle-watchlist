import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from './vehicles.service';
import { GovIlApiService, Vehicle } from '@vehicle-watchlist/api';

// Helper to create mock vehicle with required fields
const createMockVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
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
    ...overrides,
});

describe('VehiclesService', () => {
    let service: VehiclesService;
    let govIlApiService: jest.Mocked<GovIlApiService>;

    beforeEach(async () => {
        const mockGovIlApiService = {
            searchByLicensePlate: jest.fn(),
            searchWithFilters: jest.fn(),
            searchWithQuery: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VehiclesService,
                {
                    provide: GovIlApiService,
                    useValue: mockGovIlApiService,
                },
            ],
        }).compile();

        service = module.get<VehiclesService>(VehiclesService);
        govIlApiService = module.get(GovIlApiService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('searchByPlate', () => {
        it('should return vehicles when search is successful', async () => {
            const mockResult = {
                success: true,
                vehicles: [
                    {
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
                    },
                ],
                total: 1,
            };

            govIlApiService.searchByLicensePlate.mockResolvedValue(mockResult);

            const result = await service.searchByPlate('8689365');

            expect(result).toEqual(mockResult);
            expect(govIlApiService.searchByLicensePlate).toHaveBeenCalledWith('8689365');
        });

        it('should return error when search fails', async () => {
            const mockResult = {
                success: false,
                vehicles: [],
                total: 0,
                error: 'Invalid license plate format',
            };

            govIlApiService.searchByLicensePlate.mockResolvedValue(mockResult);

            const result = await service.searchByPlate('123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid license plate format');
        });
    });

    describe('getByPlate', () => {
        it('should return vehicle when found', async () => {
            const mockVehicle = {
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

            govIlApiService.searchByLicensePlate.mockResolvedValue({
                success: true,
                vehicles: [mockVehicle],
                total: 1,
            });

            const result = await service.getByPlate('8689365');

            expect(result).toEqual(mockVehicle);
        });

        it('should return null when vehicle not found', async () => {
            govIlApiService.searchByLicensePlate.mockResolvedValue({
                success: true,
                vehicles: [],
                total: 0,
            });

            const result = await service.getByPlate('9999999');

            expect(result).toBeNull();
        });

        it('should return null when search fails', async () => {
            govIlApiService.searchByLicensePlate.mockResolvedValue({
                success: false,
                vehicles: [],
                total: 0,
                error: 'API error',
            });

            const result = await service.getByPlate('8689365');

            expect(result).toBeNull();
        });
    });

    describe('searchWithFilters', () => {
        it('should return vehicles when filter search is successful', async () => {
            const mockVehicle = createMockVehicle({ year: 2009 });
            const mockResult = {
                success: true,
                vehicles: [mockVehicle],
                total: 1,
            };

            govIlApiService.searchWithQuery.mockResolvedValue(mockResult);

            const result = await service.searchWithFilters(
                { manufacturer: 'פורד', yearFrom: 2008, yearTo: 2010 },
                { limit: 20, offset: 0 }
            );

            expect(result.success).toBe(true);
            expect(result.vehicles.length).toBe(1);
            // Service now uses searchWithQuery for text-based searches
            expect(govIlApiService.searchWithQuery).toHaveBeenCalledWith(
                'פורד',
                expect.objectContaining({ limit: 20, offset: 0 })
            );
        });

        it('should return error when filter search fails', async () => {
            const mockResult = {
                success: false,
                vehicles: [],
                total: 0,
                error: 'API error',
            };

            govIlApiService.searchWithQuery.mockResolvedValue(mockResult);

            const result = await service.searchWithFilters(
                { manufacturer: 'test' },
                {}
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('API error');
        });

        it('should combine multiple filter fields into search query', async () => {
            govIlApiService.searchWithQuery.mockResolvedValue({
                success: true,
                vehicles: [],
                total: 0,
            });

            await service.searchWithFilters({
                manufacturer: 'פורד',
                model: 'FOCUS',
                color: 'לבן',
                fuelType: 'בנזין',
                ownership: 'פרטי',
            }, {});

            // All text filters are combined into a single search query
            expect(govIlApiService.searchWithQuery).toHaveBeenCalledWith(
                'פורד FOCUS לבן בנזין פרטי',
                expect.any(Object)
            );
        });

        it('should filter by year range client-side when yearTo is provided', async () => {
            const mockVehicles = [
                createMockVehicle({ id: 1, year: 2007, licensePlate: '1111111' }),
                createMockVehicle({ id: 2, year: 2009, licensePlate: '2222222' }),
                createMockVehicle({ id: 3, year: 2012, licensePlate: '3333333' }),
            ];

            govIlApiService.searchWithFilters.mockResolvedValue({
                success: true,
                vehicles: mockVehicles,
                total: 3,
            });

            const result = await service.searchWithFilters(
                { yearFrom: 2008, yearTo: 2010 },
                {}
            );

            // Only the 2009 vehicle should pass the year range filter
            expect(result.vehicles.length).toBe(1);
            expect(result.vehicles[0].year).toBe(2009);
        });

        it('should use searchWithFilters for year-only filter', async () => {
            govIlApiService.searchWithFilters.mockResolvedValue({
                success: true,
                vehicles: [],
                total: 0,
            });

            await service.searchWithFilters(
                { yearFrom: 2009 },
                { limit: 25 }
            );

            // When only yearFrom is provided, it uses exact filter
            expect(govIlApiService.searchWithFilters).toHaveBeenCalledWith(
                { shnat_yitzur: 2009 },
                { limit: 25 }
            );
        });

        it('should return error when no filters provided', async () => {
            const result = await service.searchWithFilters({}, {});

            expect(result.success).toBe(false);
            expect(result.error).toBe('At least one search filter is required');
        });
    });
});
