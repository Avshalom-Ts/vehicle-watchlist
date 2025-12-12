import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for email validation decorator
 */
export const EMAIL_VALIDATION_KEY = 'emailValidation';

/**
 * Options for email validation decorator
 */
export interface EmailValidationDecoratorOptions {
    /**
     * Whether to skip validation for this route
     */
    skip?: boolean;

    /**
     * Whether to block disposable emails
     * Overrides global setting
     */
    blockDisposable?: boolean;
}

/**
 * Decorator to enable email validation on a route
 * 
 * @example
 * ```typescript
 * @Post('register')
 * @ValidateEmail({ blockDisposable: true })
 * register(@Body() dto: RegisterDto) {
 *   // Email will be validated before reaching here
 * }
 * ```
 */
export const ValidateEmail = (
    options: EmailValidationDecoratorOptions = {}
) => SetMetadata(EMAIL_VALIDATION_KEY, options);

/**
 * Decorator to skip email validation on a route
 * 
 * @example
 * ```typescript
 * @Post('admin-register')
 * @SkipEmailValidation()
 * adminRegister(@Body() dto: RegisterDto) {
 *   // Email validation will be skipped
 * }
 * ```
 */
export const SkipEmailValidation = () =>
    SetMetadata(EMAIL_VALIDATION_KEY, { skip: true });
