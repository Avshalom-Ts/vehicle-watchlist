import {
    Injectable,
    CanActivate,
    ExecutionContext,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { EmailValidationService } from './email-validation.service';
import {
    EMAIL_VALIDATION_KEY,
    EmailValidationDecoratorOptions,
} from './email-validation.decorator';

@Injectable()
export class EmailValidationGuard implements CanActivate {
    private readonly logger = new Logger(EmailValidationGuard.name);

    constructor(
        private readonly emailValidationService: EmailValidationService,
        private readonly reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Get decorator metadata
        const options = this.reflector.getAllAndOverride<
            EmailValidationDecoratorOptions | undefined
        >(EMAIL_VALIDATION_KEY, [context.getHandler(), context.getClass()]);

        // Skip if decorator says to skip
        if (options?.skip) {
            this.logger.log('Skipping validation (skip=true)');
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const email = this.extractEmail(request);


        // If no email found in request, skip validation
        if (!email) {
            return true;
        }

        try {
            const result = await this.emailValidationService.validateEmail(email);

            // Override blockDisposable setting if specified in decorator
            const shouldBlock = options?.blockDisposable !== undefined
                ? options.blockDisposable
                : !result.isValid;

            if (shouldBlock && result.isDisposable) {
                throw new BadRequestException(
                    result.error || 'Real email addresses are required'
                );
            }

            if (!result.isValid) {
                this.logger.warn(`Blocking invalid email: ${email}`);
                throw new BadRequestException(
                    result.error || 'Invalid email address'
                );
            }

            return true;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            this.logger.error('Email validation error:', error);
            // Allow request to continue if validation service fails
            return true;
        }
    }

    /**
     * Extract email from request body
     * Checks common field names: email, Email, emailAddress
     */
    private extractEmail(request: Request): string | null {
        const body = request.body;

        if (!body) {
            return null;
        }

        // Check common email field names
        const emailFields = ['email', 'Email', 'emailAddress', 'username'];

        for (const field of emailFields) {
            if (body[field] && typeof body[field] === 'string') {
                // Check if it looks like an email
                if (body[field].includes('@')) {
                    return body[field];
                }
            }
        }

        return null;
    }
}
