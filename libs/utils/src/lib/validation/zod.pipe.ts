import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';

// Zod validation pipe for NestJS
export class ZodValidationPipe {
    constructor(private schema: z.ZodSchema) { }

    transform(value: unknown) {
        try {
            return this.schema.parse(value);
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new BadRequestException({
                    message: 'Validation failed',
                    errors: error.issues,
                });
            }
            throw error;
        }
    }
}

// Decorator to use Zod schema validation
export function UsePipes(schema: z.ZodSchema) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            const validatedArgs = args.map((arg) => {
                return schema.parse(arg);
            });
            return originalMethod.apply(this, validatedArgs);
        };
        return descriptor;
    };
}
