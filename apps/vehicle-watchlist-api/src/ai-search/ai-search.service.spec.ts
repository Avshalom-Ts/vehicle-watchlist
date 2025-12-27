import { Test, TestingModule } from '@nestjs/testing';
import { AiSearchService } from './ai-search.service';
import { PromptSearchService } from '@vehicle-watchlist/prompt-search';
import { VehiclesService } from '../vehicles/vehicles.service';

describe('AiSearchService', () => {
    let service: AiSearchService;
    let promptSearchService: PromptSearchService;
    let vehiclesService: VehiclesService;

    const mockPromptSearchService = {
        parsePrompt: jest.fn(),
        hasMinimumConfidence: jest.fn(),
        getSuggestions: jest.fn(),
    };

    const mockVehiclesService = {
        searchWithFilters: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiSearchService,
                {
                    provide: PromptSearchService,
                    useValue: mockPromptSearchService,
                },
                {
                    provide: VehiclesService,
                    useValue: mockVehiclesService,
                },
            ],
        }).compile();

        service = module.get<AiSearchService>(AiSearchService);
        promptSearchService = module.get<PromptSearchService>(PromptSearchService);
        vehiclesService = module.get<VehiclesService>(VehiclesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('searchWithPrompt', () => {
        it('should successfully search with high confidence prompt', async () => {
            const mockParsed = {
                filters: {
                    manufacturer: 'טויוטה',
                    color: 'לבן',
                    yearFrom: 2018,
                },
                confidence: 0.9,
                extractedEntities: [
                    { type: 'manufacturer', value: 'טויוטה', confidence: 0.95 },
                    { type: 'color', value: 'לבן', confidence: 0.9 },
                    { type: 'year', value: 2018, confidence: 0.85 },
                ],
                originalPrompt: 'טויוטה לבנה משנת 2018',
            };

            const mockVehicles = {
                success: true,
                vehicles: [
                    {
                        licensePlate: '12345678',
                        manufacturer: 'טויוטה',
                        color: 'לבן',
                        year: 2018,
                    },
                ],
                total: 1,
            };

            mockPromptSearchService.parsePrompt.mockResolvedValue(mockParsed);
            mockPromptSearchService.hasMinimumConfidence.mockReturnValue(true);
            mockVehiclesService.searchWithFilters.mockResolvedValue(mockVehicles);

            const result = await service.searchWithPrompt('טויוטה לבנה משנת 2018');

            expect(result.success).toBe(true);
            expect(result.vehicles).toHaveLength(1);
            expect(result.parsedPrompt).toBeDefined();
            expect(result.parsedPrompt.confidence).toBe(0.9);
            expect(result.parsedPrompt.extractedFilters).toEqual(mockParsed.filters);

            expect(mockPromptSearchService.parsePrompt).toHaveBeenCalledWith(
                'טויוטה לבנה משנת 2018'
            );
            expect(mockVehiclesService.searchWithFilters).toHaveBeenCalledWith(
                mockParsed.filters,
                {}
            );
        });

        it('should return error with suggestions for low confidence prompt', async () => {
            const mockParsed = {
                filters: {},
                confidence: 0.3,
                extractedEntities: [],
                originalPrompt: 'test',
            };

            const mockSuggestions = [
                'נסה להיות יותר ספציפי בחיפוש',
                'הוסף יצרן לחיפוש (למשל: טויוטה, מאזדה)',
            ];

            mockPromptSearchService.parsePrompt.mockResolvedValue(mockParsed);
            mockPromptSearchService.hasMinimumConfidence.mockReturnValue(false);
            mockPromptSearchService.getSuggestions.mockReturnValue(mockSuggestions);

            const result = await service.searchWithPrompt('test');

            expect(result.success).toBe(false);
            expect(result.vehicles).toHaveLength(0);
            expect(result.error).toBe('Could not understand search query');
            expect(result.parsedPrompt.suggestions).toEqual(mockSuggestions);

            expect(mockVehiclesService.searchWithFilters).not.toHaveBeenCalled();
        });

        it('should pass pagination options to vehicles service', async () => {
            const mockParsed = {
                filters: { manufacturer: 'טויוטה' },
                confidence: 0.9,
                extractedEntities: [],
                originalPrompt: 'טויוטה',
            };

            mockPromptSearchService.parsePrompt.mockResolvedValue(mockParsed);
            mockPromptSearchService.hasMinimumConfidence.mockReturnValue(true);
            mockVehiclesService.searchWithFilters.mockResolvedValue({
                success: true,
                vehicles: [],
                total: 0,
            });

            await service.searchWithPrompt('טויוטה', { limit: 50, offset: 25 });

            expect(mockVehiclesService.searchWithFilters).toHaveBeenCalledWith(
                mockParsed.filters,
                { limit: 50, offset: 25 }
            );
        });
    });
});
