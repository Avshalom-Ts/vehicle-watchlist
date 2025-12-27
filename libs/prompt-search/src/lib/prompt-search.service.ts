import { Injectable, Logger } from '@nestjs/common';
import {
  ParsedPrompt,
  VehicleSearchFilters,
  ExtractedEntity,
  PromptSearchConfig,
} from './prompt-search.types';

@Injectable()
export class PromptSearchService {
  private readonly logger = new Logger(PromptSearchService.name);
  private readonly config: Required<PromptSearchConfig>;
  private readonly ollamaUrl: string;

  constructor() {
    // Initialize with default config
    this.config = {
      enableFuzzyMatching: true,
      minConfidenceThreshold: 0.5,
      maxYearDiff: 50,
    };

    // Ollama URL (Docker service or local)
    this.ollamaUrl = process.env['OLLAMA_URL'] || 'http://ollama:11434';

    this.logger.log('AI Search initialized');
    this.logger.log(`- Ollama URL: ${this.ollamaUrl}`);
  }

  /**
   * Parse natural language prompt into structured vehicle filters
   * Priority: Ollama (local) → Basic extraction
   * Supports Hebrew and English
   */
  async parsePrompt(prompt: string): Promise<ParsedPrompt> {
    this.logger.log(`Parsing prompt: "${prompt}"`);

    // Sanitize: Remove symbols, keep only letters (Hebrew, English) and numbers
    const sanitized = prompt.replace(/[^\u0590-\u05FFa-zA-Z0-9\s]/g, ' ').trim();

    if (!sanitized) {
      return {
        filters: {},
        confidence: 0,
        extractedEntities: [],
        originalPrompt: prompt,
      };
    }

    // Try Ollama first (local, always available in Docker)
    try {
      return await this.parseWithOllama(sanitized, prompt);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Ollama failed: ${errorMessage}. Using basic extraction.`);
    }

    // Final fallback: Basic keyword extraction
    return this.parseWithBasicExtraction(sanitized, prompt);
  }

  /**
   * Parse using Ollama (local LLM running in Docker)
   * Uses llama3.2 or mistral for structured JSON output
   */
  private async parseWithOllama(sanitized: string, originalPrompt: string): Promise<ParsedPrompt> {
    const systemPrompt = `You are a vehicle search assistant for Israeli vehicles. Extract vehicle search parameters from natural language queries.

Extract these fields (all optional, in Hebrew when applicable):
- manufacturer: Car manufacturer name in Hebrew (e.g., "טויוטה", "פורד", "מאזדה", "הונדה", "סובארו")
- model: Model name if mentioned
- yearFrom: Starting year (number)
- yearTo: Ending year (number)
- color: Color in Hebrew (e.g., "לבן", "שחור", "אדום", "כחול", "אפור")
- fuelType: Fuel type in Hebrew (e.g., "בנזין", "דיזל", "חשמלי", "היברידי")
- ownership: Ownership type in Hebrew (e.g., "פרטי", "ציבורי", "מוניות")

Rules:
1. Convert English names to Hebrew (Toyota → טויוטה, white → לבן)
2. Extract year ranges (משנת 2015 עד 2020 → yearFrom: 2015, yearTo: 2020)
3. Return ONLY valid JSON, no explanations
4. Use null for missing fields

Return JSON in this exact format:
{"manufacturer": "טויוטה", "color": "לבן", "yearFrom": 2018, "fuelType": "בנזין", "confidence": 0.9}`;

    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: `${systemPrompt}\n\nUser query: "${sanitized}"\n\nJSON output:`,
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.response.trim();

    this.logger.debug(`Ollama response: ${aiResponse}`);

    const aiResult = JSON.parse(aiResponse);
    const confidence = aiResult.confidence || 0.85;
    delete aiResult.confidence;

    // Remove null values
    Object.keys(aiResult).forEach(key => {
      if (aiResult[key] === null) delete aiResult[key];
    });

    // Create extracted entities
    const extractedEntities: ExtractedEntity[] = [];
    Object.entries(aiResult).forEach(([key, value]) => {
      if (value) {
        extractedEntities.push({
          type: this.mapKeyToEntityType(key),
          value: value as string | number,
          confidence,
          position: { start: 0, end: 0 },
        });
      }
    });

    const result: ParsedPrompt = {
      filters: aiResult as VehicleSearchFilters,
      confidence,
      extractedEntities,
      originalPrompt,
    };

    this.logger.log(`Ollama parsed ${extractedEntities.length} entities, confidence ${confidence.toFixed(2)}`);
    return result;
  }

  /**
   * Fallback: Basic keyword extraction without AI
   * Used when AI is not available or fails
   */
  private parseWithBasicExtraction(sanitized: string, originalPrompt: string): ParsedPrompt {
    this.logger.debug('Using basic keyword extraction (no AI)');
    const normalized = sanitized.toLowerCase();
    const filters: VehicleSearchFilters = {};
    const extractedEntities: ExtractedEntity[] = [];

    // Extract years only (simple pattern)
    const yearRange = this.extractYearRange(normalized);
    if (yearRange) {
      extractedEntities.push(...yearRange.entities);
      if (yearRange.yearFrom) filters.yearFrom = yearRange.yearFrom;
      if (yearRange.yearTo) filters.yearTo = yearRange.yearTo;
    }

    // Basic confidence: high if years found, low otherwise
    const confidence = extractedEntities.length > 0 ? 0.6 : 0.3;

    const result: ParsedPrompt = {
      filters,
      confidence,
      extractedEntities,
      originalPrompt,
    };

    this.logger.log(`Basic extraction: ${extractedEntities.length} entities, confidence ${confidence.toFixed(2)}`);
    return result;
  }

  /**
   * Map filter keys to entity types
   */
  private mapKeyToEntityType(key: string): ExtractedEntity['type'] {
    const mapping: Record<string, ExtractedEntity['type']> = {
      manufacturer: 'manufacturer',
      model: 'model',
      yearFrom: 'year',
      yearTo: 'year',
      color: 'color',
      fuelType: 'fuelType',
      ownership: 'ownership',
    };
    return mapping[key] || 'manufacturer';
  }

  /**
   * Extract year range from prompt
   * Supports patterns like:
   * - "2015" (single year)
   * - "2015-2020" (range)
   * - "משנת 2015" (from year)
   * - "משנת 2015 עד 2020" (from-to)
   * - "בין 2015 ל-2020" (between)
   */
  private extractYearRange(prompt: string): {
    yearFrom?: number;
    yearTo?: number;
    entities: ExtractedEntity[];
  } | null {
    const entities: ExtractedEntity[] = [];
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - this.config.maxYearDiff;
    const maxYear = currentYear + 1;

    // Pattern 1: Range with dash (2015-2020)
    const rangePattern = /(\d{4})\s*-\s*(\d{4})/;
    const rangeMatch = prompt.match(rangePattern);
    if (rangeMatch) {
      const yearFrom = parseInt(rangeMatch[1]);
      const yearTo = parseInt(rangeMatch[2]);

      if (this.isValidYear(yearFrom, minYear, maxYear) &&
        this.isValidYear(yearTo, minYear, maxYear)) {
        const start = prompt.indexOf(rangeMatch[0]);
        entities.push({
          type: 'year',
          value: yearFrom,
          confidence: 1.0,
          position: { start, end: start + rangeMatch[1].length },
        });
        entities.push({
          type: 'year',
          value: yearTo,
          confidence: 1.0,
          position: {
            start: start + rangeMatch[0].indexOf(rangeMatch[2]),
            end: start + rangeMatch[0].length,
          },
        });

        return { yearFrom, yearTo, entities };
      }
    }

    // Pattern 2: From-to pattern (משנת X עד Y, from X to Y)
    const fromToPattern = /(משנת|from|מ-)\s*(\d{4})\s*(עד|to)\s*(\d{4})/;
    const fromToMatch = prompt.match(fromToPattern);
    if (fromToMatch) {
      const yearFrom = parseInt(fromToMatch[2]);
      const yearTo = parseInt(fromToMatch[4]);

      if (this.isValidYear(yearFrom, minYear, maxYear) &&
        this.isValidYear(yearTo, minYear, maxYear)) {
        return { yearFrom, yearTo, entities: this.createYearEntities(prompt, [yearFrom, yearTo]) };
      }
    }

    // Pattern 3: Between pattern (בין X ל-Y, between X and Y)
    const betweenPattern = /(בין|between)\s*(\d{4})\s*(ל-|and|to)\s*(\d{4})/;
    const betweenMatch = prompt.match(betweenPattern);
    if (betweenMatch) {
      const yearFrom = parseInt(betweenMatch[2]);
      const yearTo = parseInt(betweenMatch[4]);

      if (this.isValidYear(yearFrom, minYear, maxYear) &&
        this.isValidYear(yearTo, minYear, maxYear)) {
        return { yearFrom, yearTo, entities: this.createYearEntities(prompt, [yearFrom, yearTo]) };
      }
    }

    // Pattern 4: Single year with "from" keyword (משנת 2015, from 2015)
    const fromPattern = /(משנת|from|מ-)\s*(\d{4})/;
    const fromMatch = prompt.match(fromPattern);
    if (fromMatch) {
      const yearFrom = parseInt(fromMatch[2]);
      if (this.isValidYear(yearFrom, minYear, maxYear)) {
        return { yearFrom, entities: this.createYearEntities(prompt, [yearFrom]) };
      }
    }

    // Pattern 5: Single year (just a 4-digit number)
    const yearPattern = /\b(\d{4})\b/g;
    const years: number[] = [];
    let match;

    while ((match = yearPattern.exec(prompt)) !== null) {
      const year = parseInt(match[1]);
      if (this.isValidYear(year, minYear, maxYear)) {
        years.push(year);
        entities.push({
          type: 'year',
          value: year,
          confidence: 0.9,
          position: { start: match.index, end: match.index + 4 },
        });
      }
    }

    if (years.length === 1) {
      return { yearFrom: years[0], entities };
    } else if (years.length >= 2) {
      // If multiple years found, assume range
      const sortedYears = years.sort((a, b) => a - b);
      return {
        yearFrom: sortedYears[0],
        yearTo: sortedYears[sortedYears.length - 1],
        entities,
      };
    }

    return null;
  }

  private isValidYear(year: number, min: number, max: number): boolean {
    return year >= min && year <= max;
  }

  private createYearEntities(prompt: string, years: number[]): ExtractedEntity[] {
    return years.map((year) => {
      const yearStr = year.toString();
      const index = prompt.indexOf(yearStr);
      return {
        type: 'year' as const,
        value: year,
        confidence: 1.0,
        position: { start: index, end: index + 4 },
      };
    });
  }

  /**
   * Calculate overall confidence score based on extracted entities
   */
  private calculateConfidence(entities: ExtractedEntity[]): number {
    if (entities.length === 0) return 0;

    const avgConfidence =
      entities.reduce((sum, entity) => sum + entity.confidence, 0) /
      entities.length;

    // Bonus for having multiple entities
    const entityBonus = Math.min(entities.length * 0.1, 0.3);

    return Math.min(avgConfidence + entityBonus, 1.0);
  }

  /**
   * Check if parsed result has sufficient confidence
   */
  hasMinimumConfidence(parsed: ParsedPrompt): boolean {
    return parsed.confidence >= this.config.minConfidenceThreshold;
  }

  /**
   * Get suggested improvements for low-confidence prompts
   */
  getSuggestions(parsed: ParsedPrompt): string[] {
    const suggestions: string[] = [];

    if (parsed.confidence < this.config.minConfidenceThreshold) {
      suggestions.push('נסה להיות יותר ספציפי בחיפוש');
      suggestions.push('Try to be more specific in your search');
    }

    if (!parsed.filters.manufacturer) {
      suggestions.push('הוסף יצרן לחיפוש (למשל: טויוטה, מאזדה)');
    }

    if (!parsed.filters.yearFrom && !parsed.filters.yearTo) {
      suggestions.push('הוסף שנת ייצור (למשל: משנת 2015, 2010-2020)');
    }

    if (!parsed.filters.color) {
      suggestions.push('הוסף צבע (למשל: לבן, שחור)');
    }

    return suggestions;
  }
}
