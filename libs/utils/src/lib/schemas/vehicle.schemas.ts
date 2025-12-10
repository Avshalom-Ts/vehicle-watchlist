import { z } from 'zod';

// License plate schema - Israeli format (7-8 digits, dashes allowed)
export const licensePlateSchema = z
    .string()
    .regex(/^[\d-]{7,10}$/, 'License plate must be 7-8 digits (dashes allowed)');

// Search by license plate schema
export const searchVehicleSchema = z.object({
    plate: licensePlateSchema,
});

// Filter vehicles schema
export const filterVehiclesSchema = z.object({
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    yearFrom: z.coerce.number().int().min(1900).max(2100).optional(),
    yearTo: z.coerce.number().int().min(1900).max(2100).optional(),
    color: z.string().optional(),
    fuelType: z.string().optional(),
    ownership: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

// Vehicle response schema (from gov.il API)
export const vehicleSchema = z.object({
    id: z.number(),
    licensePlate: z.string(),
    manufacturer: z.string(),
    model: z.string(),
    commercialName: z.string(),
    year: z.number(),
    color: z.string(),
    fuelType: z.string(),
    ownership: z.string(),
    lastTestDate: z.string().nullable(),
    validUntil: z.string().nullable(),
    chassisNumber: z.string().nullable(),
    frontTire: z.string().nullable(),
    rearTire: z.string().nullable(),
    engineModel: z.string().nullable(),
    trimLevel: z.string().nullable(),
    pollutionGroup: z.number().nullable(),
    safetyLevel: z.number().nullable(),
    firstOnRoad: z.string().nullable(),
});

// Type inference
export type SearchVehicleInput = z.infer<typeof searchVehicleSchema>;
export type FilterVehiclesInput = z.infer<typeof filterVehiclesSchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;
