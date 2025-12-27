/**
 * Response from API Ninjas Disposable Email Checker
 */
export interface DisposableEmailResponse {
    /**
     * Email address checked
     */
    email: string;

    /**
     * Domain of the email address
     */
    domain: string;

    /**
     * Whether the email is disposable
     */
    is_disposable: boolean;
}

/**
 * Email validation result
 */
export interface EmailValidationResult {
    /**
     * Whether the email is valid
     */
    isValid: boolean;

    /**
     * Whether the email is disposable
     */
    isDisposable: boolean;

    /**
     * Email address
     */
    email: string;

    /**
     * Domain
     */
    domain: string;

    /**
     * Error message if validation failed
     */
    error?: string;
}

/**
 * Email validation module options
 */
export interface EmailValidationModuleOptions {
    /**
     * API Ninjas API key
     */
    apiKey: string;

    /**
     * API base URL
     * @default 'https://api.api-ninjas.com/v1'
     */
    apiUrl?: string;

    /**
     * Request timeout in milliseconds
     * @default 5000
     */
    timeout?: number;

    /**
     * Whether to block disposable emails
     * @default true
     */
    blockDisposable?: boolean;
}
