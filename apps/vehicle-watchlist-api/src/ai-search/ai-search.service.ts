import { Injectable, Logger } from '@nestjs/common';
import { PromptSearchService } from '@vehicle-watchlist/prompt-search';
import { VehiclesService } from '../vehicles/vehicles.service';
import { VehicleSearchResult } from '@vehicle-watchlist/api';

@Injectable()
export class AiSearchService {
    private readonly logger = new Logger(AiSearchService.name);

    constructor(
        private readonly promptSearchService: PromptSearchService,
        private readonly vehiclesService: VehiclesService,
    ) { }

    /**
     * Search vehicles using natural language prompt
     * 1. Parse prompt with AI (Ollama)
     * 2. Extract vehicle filters
     * 3. Search with extracted filters
     */
    async searchWithPrompt(
        prompt: string,
        options: { limit?: number; offset?: number } = {}
    ): Promise<VehicleSearchResult & { parsedPrompt?: any }> {
        this.logger.log(`AI Search request: "${prompt}"`);

        // Step 1: Parse prompt with AI
        const parsed = await this.promptSearchService.parsePrompt(prompt);

        this.logger.log(
            `Parsed ${parsed.extractedEntities.length} entities with confidence ${parsed.confidence.toFixed(2)}`
        );
        this.logger.debug(`Extracted filters: ${JSON.stringify(parsed.filters)}`);

        // Step 2: Check if we have enough confidence to search
        if (!this.promptSearchService.hasMinimumConfidence(parsed)) {
            this.logger.warn('Low confidence parse, returning suggestions');
            return {
                success: false,
                vehicles: [],
                total: 0,
                error: 'Could not understand search query',
                parsedPrompt: {
                    confidence: parsed.confidence,
                    extractedFilters: parsed.filters,
                    suggestions: this.promptSearchService.getSuggestions(parsed),
                },
            };
        }

        // Step 3: Search with extracted filters
        const result = await this.vehiclesService.searchWithFilters(parsed.filters, options);

        // Return results with parsing metadata
        return {
            ...result,
            parsedPrompt: {
                confidence: parsed.confidence,
                extractedFilters: parsed.filters,
                extractedEntities: parsed.extractedEntities,
            },
        };
    }
}
