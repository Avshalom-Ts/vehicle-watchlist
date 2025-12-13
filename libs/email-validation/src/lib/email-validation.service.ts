import { Injectable, Inject, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
    EmailValidationModuleOptions,
    EmailValidationResult,
    DisposableEmailResponse,
} from './email-validation.types';
import {
    EMAIL_VALIDATION_OPTIONS,
    DEFAULT_EMAIL_VALIDATION_OPTIONS,
} from './email-validation.constants';

@Injectable()
export class EmailValidationService {
    private readonly logger = new Logger(EmailValidationService.name);
    private readonly axiosInstance: AxiosInstance;
    private readonly options: Required<EmailValidationModuleOptions>;

    constructor(
        @Inject(EMAIL_VALIDATION_OPTIONS)
        options: EmailValidationModuleOptions
    ) {
        this.options = {
            ...DEFAULT_EMAIL_VALIDATION_OPTIONS,
            ...options,
        };

        this.axiosInstance = axios.create({
            baseURL: this.options.apiUrl,
            timeout: this.options.timeout,
            headers: {
                'X-Api-Key': this.options.apiKey,
            },
        });
    }

    /**
     * Validate an email address
     * Checks if the email is from a disposable email provider
     */
    async validateEmail(email: string): Promise<EmailValidationResult> {
        try {
            // Basic email format validation
            if (!this.isValidEmailFormat(email)) {
                return {
                    isValid: false,
                    isDisposable: false,
                    email,
                    domain: '',
                    error: 'Invalid email format',
                };
            }

            // Check if email is disposable using API Ninjas
            const response = await this.axiosInstance.get<DisposableEmailResponse>(
                '/disposableemailchecker',
                {
                    params: { email },
                }
            );

            const { is_disposable, domain } = response.data;

            // If disposable emails are blocked and email is disposable, mark as invalid
            const isValid = this.options.blockDisposable ? !is_disposable : true;

            return {
                isValid,
                isDisposable: is_disposable,
                email,
                domain,
                error: is_disposable && this.options.blockDisposable
                    ? 'Real email addresses are required'
                    : undefined,
            };
        } catch (error) {
            this.logger.error(
                `Failed to validate email ${email}:`,
                error instanceof Error ? error.message : error
            );
            
            // Log more details about the error
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response: { status: number; data: unknown } };
                this.logger.error(`API Error Status: ${axiosError.response.status}`);
                this.logger.error(`API Error Data:`, axiosError.response.data);
            }

            // On API error, fall back to basic validation
            return {
                isValid: this.isValidEmailFormat(email),
                isDisposable: false,
                email,
                domain: email.split('@')[1] || '',
                error: 'Email validation service temporarily unavailable',
            };
        }
    }

    /**
     * Validate multiple emails in batch
     */
    async validateEmails(emails: string[]): Promise<EmailValidationResult[]> {
        return Promise.all(emails.map((email) => this.validateEmail(email)));
    }

    /**
     * Check if email has valid format using regex
     */
    private isValidEmailFormat(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Check if email is disposable (uses API)
     */
    async isDisposable(email: string): Promise<boolean> {
        const result = await this.validateEmail(email);
        return result.isDisposable;
    }
}
