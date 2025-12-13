import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { AiSearchService } from './ai-search.service';
import { AiSearchDto } from './dto';
import { RateLimit, RateLimitPresets } from '@vehicle-watchlist/rate-limit';

@Controller('ai-search')
export class AiSearchController {
    constructor(private readonly aiSearchService: AiSearchService) { }

    /**
     * AI-powered vehicle search (PUBLIC)
     * POST /ai-search
     * Body: { prompt: "טויוטה לבנה משנת 2015", page: 1, limit: 25 }
     * 
     * Accepts natural language queries in Hebrew or English
     * Uses Ollama (local LLM) to parse prompt and extract filters
     */
    @Post()
    @RateLimitPresets.Moderate() // 30 requests per minute
    @HttpCode(HttpStatus.OK)
    async searchWithAI(@Body() dto: AiSearchDto) {
        const offset = (dto.page - 1) * dto.limit;

        const result = await this.aiSearchService.searchWithPrompt(dto.prompt, {
            limit: dto.limit,
            offset,
        });

        if (!result.success) {
            throw new BadRequestException({
                success: false,
                error: result.error || 'AI search failed',
                parsedPrompt: result.parsedPrompt,
            });
        }

        return {
            success: true,
            data: result.vehicles,
            total: result.total,
            page: dto.page,
            limit: dto.limit,
            totalPages: Math.ceil(result.total / dto.limit),
            parsedPrompt: result.parsedPrompt,
        };
    }
}
