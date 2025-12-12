import { Test, TestingModule } from '@nestjs/testing';
import { EmailValidationService } from './email-validation.service';
import { EMAIL_VALIDATION_OPTIONS } from './email-validation.constants';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('EmailValidationService', () => {
    let service: EmailValidationService;

    const mockAxiosInstance = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        mockedAxios.create.mockReturnValue(
            mockAxiosInstance as unknown as ReturnType<typeof axios.create>
        );

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailValidationService,
                {
                    provide: EMAIL_VALIDATION_OPTIONS,
                    useValue: {
                        apiKey: 'test-api-key',
                        apiUrl: 'https://api.api-ninjas.com/v1',
                        timeout: 5000,
                        blockDisposable: true,
                    },
                },
            ],
        }).compile();

        service = module.get<EmailValidationService>(EmailValidationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateEmail', () => {
        it('should validate non-disposable email', async () => {
            mockAxiosInstance.get.mockResolvedValue({
                data: {
                    email: 'user@gmail.com',
                    domain: 'gmail.com',
                    is_disposable: false,
                },
            });

            const result = await service.validateEmail('user@gmail.com');

            expect(result).toEqual({
                isValid: true,
                isDisposable: false,
                email: 'user@gmail.com',
                domain: 'gmail.com',
                error: undefined,
            });
        });

        it('should reject disposable email when blockDisposable is true', async () => {
            mockAxiosInstance.get.mockResolvedValue({
                data: {
                    email: 'test@10minutemail.com',
                    domain: '10minutemail.com',
                    is_disposable: true,
                },
            });

            const result = await service.validateEmail('test@10minutemail.com');

            expect(result).toEqual({
                isValid: false,
                isDisposable: true,
                email: 'test@10minutemail.com',
                domain: '10minutemail.com',
                error: 'Disposable email addresses are not allowed',
            });
        });

        it('should return invalid for malformed email', async () => {
            const result = await service.validateEmail('invalid-email');

            expect(result).toEqual({
                isValid: false,
                isDisposable: false,
                email: 'invalid-email',
                domain: '',
                error: 'Invalid email format',
            });
            expect(mockAxiosInstance.get).not.toHaveBeenCalled();
        });

        it('should handle API errors gracefully', async () => {
            mockAxiosInstance.get.mockRejectedValue(new Error('API Error'));

            const result = await service.validateEmail('user@gmail.com');

            expect(result).toEqual({
                isValid: true,
                isDisposable: false,
                email: 'user@gmail.com',
                domain: 'gmail.com',
                error: 'Email validation service temporarily unavailable',
            });
        });
    });

    describe('validateEmails', () => {
        it('should validate multiple emails', async () => {
            mockAxiosInstance.get
                .mockResolvedValueOnce({
                    data: {
                        email: 'user1@gmail.com',
                        domain: 'gmail.com',
                        is_disposable: false,
                    },
                })
                .mockResolvedValueOnce({
                    data: {
                        email: 'user2@yahoo.com',
                        domain: 'yahoo.com',
                        is_disposable: false,
                    },
                });

            const results = await service.validateEmails([
                'user1@gmail.com',
                'user2@yahoo.com',
            ]);

            expect(results).toHaveLength(2);
            expect(results[0].isValid).toBe(true);
            expect(results[1].isValid).toBe(true);
        });
    });

    describe('isDisposable', () => {
        it('should return true for disposable email', async () => {
            mockAxiosInstance.get.mockResolvedValue({
                data: {
                    email: 'test@10minutemail.com',
                    domain: '10minutemail.com',
                    is_disposable: true,
                },
            });

            const result = await service.isDisposable('test@10minutemail.com');

            expect(result).toBe(true);
        });

        it('should return false for non-disposable email', async () => {
            mockAxiosInstance.get.mockResolvedValue({
                data: {
                    email: 'user@gmail.com',
                    domain: 'gmail.com',
                    is_disposable: false,
                },
            });

            const result = await service.isDisposable('user@gmail.com');

            expect(result).toBe(false);
        });
    });
});
