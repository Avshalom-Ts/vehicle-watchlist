/**
 * Gov.il API Types for Vehicle Data
 * Resource: https://data.gov.il/api/3/action/datastore_search
 */

// Raw vehicle record from gov.il API
export interface GovIlVehicleRecord {
    _id: number;
    mispar_rechev: number; // License plate number
    tozeret_cd: number; // Manufacturer code
    sug_degem: string; // Vehicle type (P = Private)
    tozeret_nm: string; // Manufacturer name (Hebrew)
    degem_cd: number; // Model code
    degem_nm: string; // Model name
    ramat_gimur: string; // Trim level
    ramat_eivzur_betihuty: number | null; // Safety equipment level
    kvutzat_zihum: number | null; // Pollution group
    shnat_yitzur: number; // Year of manufacture
    degem_manoa: string; // Engine model
    mivchan_acharon_dt: string; // Last test date (YYYY-MM-DD)
    tokef_dt: string; // Validity date (YYYY-MM-DD)
    baalut: string; // Ownership type (פרטי, ליסינג, etc.)
    misgeret: string; // Chassis/VIN number
    tzeva_cd: number; // Color code
    tzeva_rechev: string; // Color name (Hebrew)
    zmig_kidmi: string; // Front tire size
    zmig_ahori: string; // Rear tire size
    sug_delek_nm: string; // Fuel type (בנזין, דיזל, חשמלי, etc.)
    horaat_rishum: number | null; // Registration instruction
    moed_aliya_lakvish: string | null; // Date first on road (YYYY-MM)
    kinuy_mishari: string; // Commercial name
}

// Gov.il API response structure
export interface GovIlApiResponse {
    help: string;
    success: boolean;
    result?: {
        include_total: boolean;
        limit: number;
        records_format: string;
        resource_id: string;
        total_estimation_threshold: number | null;
        records: GovIlVehicleRecord[];
        fields: Array<{ id: string; type: string }>;
        _links: {
            start: string;
            next: string;
        };
        total: number;
        total_was_estimated: boolean;
    };
    error?: {
        __type: string;
        message: string;
    };
}

// Cleaned/normalized vehicle data for frontend
export interface Vehicle {
    id: number;
    licensePlate: string;
    manufacturer: string;
    model: string;
    commercialName: string;
    year: number;
    color: string;
    fuelType: string;
    ownership: string;
    lastTestDate: string | null;
    validUntil: string | null;
    chassisNumber: string;
    frontTire: string;
    rearTire: string;
    engineModel: string;
    trimLevel: string;
    pollutionGroup: number | null;
    safetyLevel: number | null;
    firstOnRoad: string | null;
}

// Filter options for querying vehicles (raw API field names)
export interface VehicleFilters {
    mispar_rechev?: string | number; // License plate
    tozeret_nm?: string; // Manufacturer name
    kinuy_mishari?: string; // Commercial name/model
    shnat_yitzur?: number; // Year
    tzeva_rechev?: string; // Color
    sug_delek_nm?: string; // Fuel type
    baalut?: string; // Ownership type
}

// User-friendly filter options (for service layer)
export interface VehicleFilterOptions {
    manufacturer?: string;
    model?: string;
    yearFrom?: number;
    yearTo?: number;
    color?: string;
    fuelType?: string;
    ownership?: string;
}

// Search options
export interface VehicleSearchOptions {
    licensePlate?: string;
    filters?: VehicleFilters;
    searchQuery?: string; // Full-text search across all fields
    limit?: number;
    offset?: number;
}

// Search result
export interface VehicleSearchResult {
    success: boolean;
    vehicles: Vehicle[];
    total: number;
    error?: string;
}

// Injection token for optional config
export const GOV_IL_CONFIG_TOKEN = 'GOV_IL_CONFIG';

// Gov.il API configuration
export interface GovIlApiConfig {
    baseUrl: string;
    resourceId: string;
    timeout: number;
}

export const DEFAULT_GOV_IL_CONFIG: GovIlApiConfig = {
    baseUrl: 'https://data.gov.il/api/3/action/datastore_search',
    resourceId: '053cea08-09bc-40ec-8f7a-156f0677aff3', // Private & commercial vehicles - 4M+ records, updated daily
    timeout: 10000, // 10 seconds
};
