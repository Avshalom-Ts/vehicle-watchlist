import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * AI Search Request DTO
 * Accepts natural language prompts in Hebrew or English
 */
export const aiSearchSchema = z.object({
    prompt: z.string()
        .min(2, 'Prompt must be at least 2 characters')
        .max(500, 'Prompt must not exceed 500 characters')
        .describe('Natural language search query (Hebrew or English)'),

    page: z.coerce.number()
        .int()
        .positive()
        .default(1)
        .describe('Page number (1-based)'),

    limit: z.coerce.number()
        .int()
        .positive()
        .max(100)
        .default(25)
        .describe('Results per page (max 100)'),
});

export class AiSearchDto extends createZodDto(aiSearchSchema) { }
