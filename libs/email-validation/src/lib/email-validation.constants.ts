/**
 * Injection token for email validation options
 */
export const EMAIL_VALIDATION_OPTIONS = 'EMAIL_VALIDATION_OPTIONS';

/**
 * Default options for email validation
 */
export const DEFAULT_EMAIL_VALIDATION_OPTIONS = {
    apiUrl: 'https://api.api-ninjas.com/v1',
    timeout: 5000,
    blockDisposable: true,
};
