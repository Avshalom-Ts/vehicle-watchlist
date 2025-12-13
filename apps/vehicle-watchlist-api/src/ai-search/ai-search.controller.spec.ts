import { Test, TestingModule } from '@nestjs/testing';
import { AiSearchController } from './ai-search.controller';
import { AiSearchService } from './ai-search.service';

describe('AiSearchController', () => {
    let controller: AiSearchController;
    let service: AiSearchService;

    const mockAiSearchService = {
        searchWithPrompt: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AiSearchController],
            providers: [
                {
                    provide: AiSearchService,
                    useValue: mockAiSearchService,
                },
            ],
        }).compile();

        controller = module.get<AiSearchController>(AiSearchController);
        service = module.get<AiSearchService>(AiSearchService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('searchWithAI', () => {
        it('should return successful AI search results', async () => {
            const mockResult = {
                success: true,
                vehicles: [
                    {
                        licensePlate: '12345678',
                        manufacturer: 'טויוטה',
                        model: 'קורולה',
                        year: 2018,
                        color: 'לבן',
                        fuelType: 'בנזין',
                    },
                ],
                total: 1,
                parsedPrompt: {
                    confidence: 0.9,
                    extractedFilters: {
                        manufacturer: 'טויוטה',
                        color: 'לבן',
                        yearFrom: 2018,
                    },
                    extractedEntities: [],
                },
            };

            mockAiSearchService.searchWithPrompt.mockResolvedValue(mockResult);

            const result = await controller.searchWithAI({
                prompt: 'טויוטה לבנה משנת 2018',
                page: 1,
                limit: 25,
            });

            expect(result).toEqual({
                success: true,
                data: mockResult.vehicles,
                total: 1,
                page: 1,
                limit: 25,
                totalPages: 1,
                parsedPrompt: mockResult.parsedPrompt,
            });

            expect(mockAiSearchService.searchWithPrompt).toHaveBeenCalledWith(
                'טויוטה לבנה משנת 2018',
                { limit: 25, offset: 0 }
            );
        });

        it('should throw BadRequestException on failed search', async () => {
            const mockResult = {
                success: false,
                vehicles: [],
                total: 0,
                error: 'Could not understand search query',
                parsedPrompt: {
                    confidence: 0.3,
                    extractedFilters: {},
                    suggestions: ['נסה להיות יותר ספציפי בחיפוש'],
                },
            };

            mockAiSearchService.searchWithPrompt.mockResolvedValue(mockResult);

            await expect(
                controller.searchWithAI({
                    prompt: 'test',
                    page: 1,
                    limit: 25,
                })
            ).rejects.toThrow();
        });

        it('should calculate correct pagination', async () => {
            const mockResult = {
                success: true,
                vehicles: [],
                total: 100,
                parsedPrompt: { confidence: 0.9 },
            };

            mockAiSearchService.searchWithPrompt.mockResolvedValue(mockResult);

            const result = await controller.searchWithAI({
                prompt: 'test',
                page: 2,
                limit: 25,
            });

            expect(result.page).toBe(2);
            expect(result.totalPages).toBe(4);
            expect(mockAiSearchService.searchWithPrompt).toHaveBeenCalledWith('test', {
                limit: 25,
                offset: 25,
            });
        });
    });
});
