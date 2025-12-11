import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod.pipe';

describe('ZodValidationPipe', () => {
    describe('transform', () => {
        const testSchema = z.object({
            name: z.string().min(2),
            age: z.number().int().positive(),
            email: z.string().email().optional(),
        });

        let pipe: ZodValidationPipe;

        beforeEach(() => {
            pipe = new ZodValidationPipe(testSchema);
        });

        it('should return parsed data for valid input', () => {
            const input = {
                name: 'John',
                age: 25,
                email: 'john@example.com',
            };

            const result = pipe.transform(input);
            expect(result).toEqual(input);
        });

        it('should return parsed data without optional fields', () => {
            const input = {
                name: 'John',
                age: 25,
            };

            const result = pipe.transform(input);
            expect(result).toEqual(input);
        });

        it('should throw BadRequestException for invalid input', () => {
            const input = {
                name: 'J', // Too short
                age: 25,
            };

            expect(() => pipe.transform(input)).toThrow(BadRequestException);
        });

        it('should include validation errors in exception', () => {
            const input = {
                name: 'J', // Too short
                age: -5, // Not positive
                email: 'invalid', // Not valid email
            };

            try {
                pipe.transform(input);
                fail('Expected BadRequestException to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(BadRequestException);
                const response = (error as BadRequestException).getResponse();
                expect(response).toHaveProperty('message', 'Validation failed');
                expect(response).toHaveProperty('errors');
                expect(Array.isArray((response as Record<string, unknown>)['errors'])).toBe(true);
            }
        });

        it('should throw BadRequestException for missing required fields', () => {
            const input = {
                name: 'John',
                // Missing age
            };

            expect(() => pipe.transform(input)).toThrow(BadRequestException);
        });

        it('should throw BadRequestException for wrong type', () => {
            const input = {
                name: 'John',
                age: 'twenty-five', // Should be number
            };

            expect(() => pipe.transform(input)).toThrow(BadRequestException);
        });

        it('should re-throw non-Zod errors', () => {
            const mockSchema = {
                parse: jest.fn().mockImplementation(() => {
                    throw new Error('Some other error');
                }),
            };

            const customPipe = new ZodValidationPipe(mockSchema as unknown as z.ZodSchema);
            expect(() => customPipe.transform({})).toThrow(Error);
            expect(() => customPipe.transform({})).toThrow('Some other error');
        });
    });

    describe('with different schema types', () => {
        it('should work with string schema', () => {
            const stringSchema = z.string().min(3).max(10);
            const pipe = new ZodValidationPipe(stringSchema);

            expect(pipe.transform('hello')).toBe('hello');
            expect(() => pipe.transform('hi')).toThrow(BadRequestException);
            expect(() => pipe.transform('this is too long')).toThrow(BadRequestException);
        });

        it('should work with number schema', () => {
            const numberSchema = z.number().min(0).max(100);
            const pipe = new ZodValidationPipe(numberSchema);

            expect(pipe.transform(50)).toBe(50);
            expect(() => pipe.transform(-1)).toThrow(BadRequestException);
            expect(() => pipe.transform(101)).toThrow(BadRequestException);
        });

        it('should work with array schema', () => {
            const arraySchema = z.array(z.string()).min(1).max(5);
            const pipe = new ZodValidationPipe(arraySchema);

            expect(pipe.transform(['a', 'b'])).toEqual(['a', 'b']);
            expect(() => pipe.transform([])).toThrow(BadRequestException);
            expect(() => pipe.transform(['a', 'b', 'c', 'd', 'e', 'f'])).toThrow(BadRequestException);
        });

        it('should work with enum schema', () => {
            const enumSchema = z.enum(['active', 'inactive', 'pending']);
            const pipe = new ZodValidationPipe(enumSchema);

            expect(pipe.transform('active')).toBe('active');
            expect(() => pipe.transform('unknown')).toThrow(BadRequestException);
        });
    });
});
