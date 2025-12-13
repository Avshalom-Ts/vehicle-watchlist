import { Test, TestingModule } from '@nestjs/testing';
import { PromptSearchService } from './prompt-search.service';

describe('PromptSearchService', () => {
  let service: PromptSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptSearchService],
    }).compile();

    service = module.get<PromptSearchService>(PromptSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parsePrompt - Hebrew prompts', () => {
    it('should extract manufacturer from Hebrew', () => {
      const result = service.parsePrompt('טויוטה');
      expect(result.filters.manufacturer).toBe('טויוטה');
      expect(result.extractedEntities).toHaveLength(1);
      expect(result.extractedEntities[0].type).toBe('manufacturer');
    });

    it('should extract color from Hebrew', () => {
      const result = service.parsePrompt('רכב לבן');
      expect(result.filters.color).toBe('לבן');
      expect(result.extractedEntities).toHaveLength(1);
    });

    it('should extract manufacturer and color', () => {
      const result = service.parsePrompt('טויוטה לבנה');
      expect(result.filters.manufacturer).toBe('טויוטה');
      expect(result.filters.color).toBe('לבן');
      expect(result.extractedEntities).toHaveLength(2);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should extract year range with dash', () => {
      const result = service.parsePrompt('רכב משנת 2015-2020');
      expect(result.filters.yearFrom).toBe(2015);
      expect(result.filters.yearTo).toBe(2020);
      expect(result.extractedEntities.filter(e => e.type === 'year')).toHaveLength(2);
    });

    it('should extract year with "משנת" keyword', () => {
      const result = service.parsePrompt('משנת 2015');
      expect(result.filters.yearFrom).toBe(2015);
      expect(result.filters.yearTo).toBeUndefined();
    });

    it('should extract fuel type', () => {
      const result = service.parsePrompt('רכב חשמלי');
      expect(result.filters.fuelType).toBe('חשמלי');
    });

    it('should extract ownership type', () => {
      const result = service.parsePrompt('רכב פרטי');
      expect(result.filters.ownership).toBe('פרטי');
    });

    it('should parse complex Hebrew prompt', () => {
      const result = service.parsePrompt('טויוטה לבנה משנת 2018 עד 2022 בנזין פרטי');
      expect(result.filters.manufacturer).toBe('טויוטה');
      expect(result.filters.color).toBe('לבן');
      expect(result.filters.yearFrom).toBe(2018);
      expect(result.filters.yearTo).toBe(2022);
      expect(result.filters.fuelType).toBe('בנזין');
      expect(result.filters.ownership).toBe('פרטי');
      expect(result.extractedEntities.length).toBeGreaterThanOrEqual(5);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('parsePrompt - English prompts', () => {
    it('should extract manufacturer from English', () => {
      const result = service.parsePrompt('Toyota');
      expect(result.filters.manufacturer).toBe('טויוטה');
    });

    it('should extract color from English', () => {
      const result = service.parsePrompt('white car');
      expect(result.filters.color).toBe('לבן');
    });

    it('should extract year range from English', () => {
      const result = service.parsePrompt('from 2015 to 2020');
      expect(result.filters.yearFrom).toBe(2015);
      expect(result.filters.yearTo).toBe(2020);
    });

    it('should parse complex English prompt', () => {
      const result = service.parsePrompt('white Toyota from 2018 gasoline private');
      expect(result.filters.manufacturer).toBe('טויוטה');
      expect(result.filters.color).toBe('לבן');
      expect(result.filters.yearFrom).toBe(2018);
      expect(result.filters.fuelType).toBe('בנזין');
      expect(result.filters.ownership).toBe('פרטי');
    });
  });

  describe('parsePrompt - Mixed language prompts', () => {
    it('should handle mixed Hebrew and English', () => {
      const result = service.parsePrompt('Toyota לבנה 2020');
      expect(result.filters.manufacturer).toBe('טויוטה');
      expect(result.filters.color).toBe('לבן');
      expect(result.filters.yearFrom).toBe(2020);
    });
  });

  describe('Year extraction edge cases', () => {
    it('should handle single year', () => {
      const result = service.parsePrompt('2020');
      expect(result.filters.yearFrom).toBe(2020);
      expect(result.filters.yearTo).toBeUndefined();
    });

    it('should handle year range with spaces', () => {
      const result = service.parsePrompt('2015 - 2020');
      expect(result.filters.yearFrom).toBe(2015);
      expect(result.filters.yearTo).toBe(2020);
    });

    it('should reject invalid years', () => {
      const result = service.parsePrompt('1800'); // Too old
      expect(result.filters.yearFrom).toBeUndefined();
    });

    it('should handle multiple years as range', () => {
      const result = service.parsePrompt('2015 2018 2020');
      expect(result.filters.yearFrom).toBe(2015);
      expect(result.filters.yearTo).toBe(2020);
    });
  });

  describe('Confidence calculation', () => {
    it('should return 0 confidence for empty prompt', () => {
      const result = service.parsePrompt('');
      expect(result.confidence).toBe(0);
      expect(result.extractedEntities).toHaveLength(0);
    });

    it('should return low confidence for unrecognized prompt', () => {
      const result = service.parsePrompt('xyz abc 123');
      expect(result.confidence).toBe(0);
    });

    it('should return high confidence for well-formed prompt', () => {
      const result = service.parsePrompt('טויוטה לבנה 2020 בנזין');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should increase confidence with more entities', () => {
      const result1 = service.parsePrompt('טויוטה');
      const result2 = service.parsePrompt('טויוטה לבנה');
      const result3 = service.parsePrompt('טויוטה לבנה 2020');

      expect(result2.confidence).toBeGreaterThan(result1.confidence);
      expect(result3.confidence).toBeGreaterThan(result2.confidence);
    });
  });

  describe('hasMinimumConfidence', () => {
    it('should return true for high confidence results', () => {
      const result = service.parsePrompt('טויוטה לבנה 2020');
      expect(service.hasMinimumConfidence(result)).toBe(true);
    });

    it('should return false for low confidence results', () => {
      const result = service.parsePrompt('unknown text');
      expect(service.hasMinimumConfidence(result)).toBe(false);
    });
  });

  describe('getSuggestions', () => {
    it('should suggest adding manufacturer', () => {
      const result = service.parsePrompt('לבן 2020');
      const suggestions = service.getSuggestions(result);
      const hasManufacturerSuggestion = suggestions.some(s => s.includes('יצרן'));
      expect(hasManufacturerSuggestion).toBe(true);
    });

    it('should suggest adding year', () => {
      const result = service.parsePrompt('טויוטה לבנה');
      const suggestions = service.getSuggestions(result);
      const hasYearSuggestion = suggestions.some(s => s.includes('שנת ייצור'));
      expect(hasYearSuggestion).toBe(true);
    });

    it('should suggest adding color', () => {
      const result = service.parsePrompt('טויוטה 2020');
      const suggestions = service.getSuggestions(result);
      const hasColorSuggestion = suggestions.some(s => s.includes('צבע'));
      expect(hasColorSuggestion).toBe(true);
    });

    it('should return empty suggestions for complete prompt', () => {
      const result = service.parsePrompt('טויוטה לבנה 2020');
      const suggestions = service.getSuggestions(result);
      // Should have minimal suggestions
      expect(suggestions.length).toBeLessThan(3);
    });
  });

  describe('Manufacturer variations', () => {
    it('should recognize Ford variations', () => {
      expect(service.parsePrompt('ford').filters.manufacturer).toBe('פורד');
      expect(service.parsePrompt('פורד').filters.manufacturer).toBe('פורד');
    });

    it('should recognize Mazda variations', () => {
      expect(service.parsePrompt('mazda').filters.manufacturer).toBe('מאזדה');
      expect(service.parsePrompt('מאזדה').filters.manufacturer).toBe('מאזדה');
      expect(service.parsePrompt('מזדה').filters.manufacturer).toBe('מאזדה');
    });

    it('should recognize Mercedes variations', () => {
      expect(service.parsePrompt('mercedes').filters.manufacturer).toBe('מרצדס-בנץ');
      expect(service.parsePrompt('benz').filters.manufacturer).toBe('מרצדס-בנץ');
      expect(service.parsePrompt('מרצדס').filters.manufacturer).toBe('מרצדס-בנץ');
    });
  });
});
