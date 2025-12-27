/**
 * Types for AI-powered vehicle search using natural language prompts
 */

export interface VehicleSearchFilters {
  manufacturer?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  color?: string;
  fuelType?: string;
  ownership?: string;
}

export interface ParsedPrompt {
  filters: VehicleSearchFilters;
  confidence: number; // 0-1 score indicating parsing confidence
  extractedEntities: ExtractedEntity[];
  originalPrompt: string;
}

export interface ExtractedEntity {
  type: 'manufacturer' | 'model' | 'year' | 'color' | 'fuelType' | 'ownership';
  value: string | number;
  confidence: number;
  position: {
    start: number;
    end: number;
  };
}

/**
 * Dictionary of known entities in Hebrew and English
 */
export interface EntityDictionary {
  manufacturers: EntityMap;
  colors: EntityMap;
  fuelTypes: EntityMap;
  ownership: EntityMap;
  yearKeywords: string[];
}

export interface EntityMap {
  [key: string]: string[]; // normalized value -> list of variations
}

export interface PromptSearchConfig {
  enableFuzzyMatching?: boolean;
  minConfidenceThreshold?: number;
  maxYearDiff?: number;
}
