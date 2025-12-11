import {
    registerSchema,
    loginSchema,
    jwtPayloadSchema,
    refreshTokenSchema,
    userSchema,
} from './auth.schemas';

describe('Auth Schemas', () => {
    describe('registerSchema', () => {
        it('should validate a correct registration input', () => {
            const validInput = {
                email: 'test@example.com',
                password: 'Test1234',
                name: 'John Doe',
            };

            const result = registerSchema.safeParse(validInput);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.email).toBe('test@example.com');
                expect(result.data.name).toBe('John Doe');
            }
        });

        it('should normalize email to lowercase and trim', () => {
            const input = {
                email: '  TEST@EXAMPLE.COM  ',
                password: 'Test1234',
                name: 'John Doe',
            };

            const result = registerSchema.safeParse(input);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.email).toBe('test@example.com');
            }
        });

        it('should reject invalid email', () => {
            const input = {
                email: 'not-an-email',
                password: 'Test1234',
                name: 'John Doe',
            };

            const result = registerSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('should reject password without uppercase', () => {
            const input = {
                email: 'test@example.com',
                password: 'test1234',
                name: 'John Doe',
            };

            const result = registerSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('should reject password without lowercase', () => {
            const input = {
                email: 'test@example.com',
                password: 'TEST1234',
                name: 'John Doe',
            };

            const result = registerSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('should reject password without number', () => {
            const input = {
                email: 'test@example.com',
                password: 'Testtest',
                name: 'John Doe',
            };

            const result = registerSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('should reject password shorter than 8 characters', () => {
            const input = {
                email: 'test@example.com',
                password: 'Test1',
                name: 'John Doe',
            };

            const result = registerSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('should reject name shorter than 2 characters', () => {
            const input = {
                email: 'test@example.com',
                password: 'Test1234',
                name: 'J',
            };

            const result = registerSchema.safeParse(input);
            expect(result.success).toBe(false);
        });
    });

    describe('loginSchema', () => {
        it('should validate correct login input', () => {
            const validInput = {
                email: 'test@example.com',
                password: 'anypassword',
            };

            const result = loginSchema.safeParse(validInput);
            expect(result.success).toBe(true);
        });

        it('should normalize email', () => {
            const input = {
                email: '  TEST@EXAMPLE.COM  ',
                password: 'Test1234',
            };

            const result = loginSchema.safeParse(input);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.email).toBe('test@example.com');
            }
        });

        it('should reject empty password', () => {
            const input = {
                email: 'test@example.com',
                password: '',
            };

            const result = loginSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('should reject invalid email', () => {
            const input = {
                email: 'invalid',
                password: 'Test1234',
            };

            const result = loginSchema.safeParse(input);
            expect(result.success).toBe(false);
        });
    });

    describe('jwtPayloadSchema', () => {
        it('should validate correct JWT payload', () => {
            const validPayload = {
                sub: '123456',
                email: 'test@example.com',
                name: 'John Doe',
            };

            const result = jwtPayloadSchema.safeParse(validPayload);
            expect(result.success).toBe(true);
        });

        it('should reject payload without sub', () => {
            const invalidPayload = {
                email: 'test@example.com',
                name: 'John Doe',
            };

            const result = jwtPayloadSchema.safeParse(invalidPayload);
            expect(result.success).toBe(false);
        });
    });

    describe('refreshTokenSchema', () => {
        it('should validate correct refresh token', () => {
            const validInput = {
                refresh_token: 'some-refresh-token',
            };

            const result = refreshTokenSchema.safeParse(validInput);
            expect(result.success).toBe(true);
        });

        it('should reject empty refresh token', () => {
            const invalidInput = {
                refresh_token: '',
            };

            const result = refreshTokenSchema.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });
    });

    describe('userSchema', () => {
        it('should validate correct user object', () => {
            const validUser = {
                id: '123',
                email: 'test@example.com',
                name: 'John Doe',
            };

            const result = userSchema.safeParse(validUser);
            expect(result.success).toBe(true);
        });

        it('should accept optional dates', () => {
            const validUser = {
                id: '123',
                email: 'test@example.com',
                name: 'John Doe',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = userSchema.safeParse(validUser);
            expect(result.success).toBe(true);
        });
    });
});
