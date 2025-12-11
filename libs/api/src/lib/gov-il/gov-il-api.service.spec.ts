import { GovIlApiService } from './gov-il-api.service';

describe('GovIlApiService', () => {
    let service: GovIlApiService;

    beforeEach(() => {
        service = new GovIlApiService();
    });

    describe('License Plate Validation', () => {
        it('should validate correct license plates', () => {
            expect(GovIlApiService.isValidLicensePlateFormat('1234567')).toBe(true);
            expect(GovIlApiService.isValidLicensePlateFormat('12345678')).toBe(true);
        });

        it('should validate plates with dashes', () => {
            expect(GovIlApiService.isValidLicensePlateFormat('12-345-67')).toBe(true);
            expect(GovIlApiService.isValidLicensePlateFormat('123-45-678')).toBe(true);
        });

        it('should reject invalid license plates', () => {
            expect(GovIlApiService.isValidLicensePlateFormat('123456')).toBe(false); // Too short (6 digits)
            expect(GovIlApiService.isValidLicensePlateFormat('123456789')).toBe(false); // Too long (9 digits)
            expect(GovIlApiService.isValidLicensePlateFormat('abc')).toBe(false); // Letters only
            expect(GovIlApiService.isValidLicensePlateFormat('')).toBe(false); // Empty
        });
    });

    describe('searchByLicensePlate', () => {
        it('should return error for invalid license plate', async () => {
            const result = await service.searchByLicensePlate('abc');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid license plate format');
            expect(result.vehicles).toEqual([]);
        });

        it('should clean license plate before validation', async () => {
            // Mock fetch to avoid actual API call
            const mockFetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    result: {
                        records: [],
                        total: 0,
                    },
                }),
            });
            global.fetch = mockFetch;

            await service.searchByLicensePlate('12-345-67');

            expect(mockFetch).toHaveBeenCalled();
            const url = mockFetch.mock.calls[0][0];
            expect(url).toContain('1234567');
        });
    });

    describe('searchVehicles', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });

        it('should handle API success response', async () => {
            const mockResponse = {
                success: true,
                result: {
                    records: [
                        {
                            _id: 1,
                            mispar_rechev: 1234567,
                            tozeret_cd: 10,
                            tozeret_nm: 'טויוטה',
                            degem_cd: 100,
                            sug_degem: 'P',
                            kinuy_mishari: 'קורולה',
                            shnat_yitzur: 2020,
                            tzeva_cd: 1,
                            tzeva_rechev: 'לבן',
                            sug_delek_nm: 'בנזין',
                            baalut: 'פרטי',
                            mivchan_acharon_dt: '2024-01-15',
                            tokef_dt: '2025-01-15',
                            misgeret: 'ABC123',
                            degem_nm: 'XYZ',
                            zmig_kidmi: '205/55R16',
                            zmig_ahori: '205/55R16',
                            degem_manoa: '2ZR',
                            ramat_gimur: 'LX',
                            kvutzat_zihum: 5,
                            ramat_eivzur_betihuty: 7,
                            horaat_rishum: null,
                            moed_aliya_lakvish: '2020-06',
                        },
                    ],
                    total: 1,
                },
            };

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await service.searchVehicles({ licensePlate: '1234567' });

            expect(result.success).toBe(true);
            expect(result.vehicles).toHaveLength(1);
            expect(result.vehicles[0]).toEqual({
                id: 1,
                licensePlate: '1234567',
                manufacturer: 'טויוטה',
                manufacturerCode: expect.any(Number),
                model: 'XYZ',
                modelCode: expect.any(Number),
                modelType: expect.any(String),
                commercialName: 'קורולה',
                year: 2020,
                color: 'לבן',
                colorCode: expect.any(Number),
                fuelType: 'בנזין',
                ownership: 'פרטי',
                lastTestDate: '2024-01-15',
                validUntil: '2025-01-15',
                chassisNumber: 'ABC123',
                frontTire: '205/55R16',
                rearTire: '205/55R16',
                engineModel: '2ZR',
                trimLevel: 'LX',
                pollutionGroup: 5,
                safetyLevel: 7,
                registrationInstruction: null,
                firstOnRoad: '2020-06',
            });
        });

        it('should handle API error response', async () => {
            const mockResponse = {
                success: false,
                error: {
                    __type: 'Not Found Error',
                    message: 'Resource not found',
                },
            };

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await service.searchVehicles({ licensePlate: '1234567' });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Resource not found');
        });

        it('should handle network errors', async () => {
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

            const result = await service.searchVehicles({ licensePlate: '1234567' });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Network error');
        });

        it('should handle non-OK HTTP responses', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 500,
            });

            const result = await service.searchVehicles({ licensePlate: '1234567' });

            expect(result.success).toBe(false);
        });
    });
});
