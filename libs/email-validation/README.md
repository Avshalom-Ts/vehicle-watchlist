# @vehicle-watchlist/email-validation

A NestJS library for validating email addresses and detecting disposable email providers using the API Ninjas Disposable Email Checker API.

## Features

- Easy integration with NestJS
- Decorator-based email validation
- Detects disposable/temporary email addresses
- Guard-based automatic validation
- Configurable blocking of disposable emails
- Full TypeScript support
- Comprehensive test coverage

## Quick Start

```typescript
import { EmailValidationModule } from '@vehicle-watchlist/email-validation';

@Module({
  imports: [
    EmailValidationModule.register({
      options: {
        apiKey: process.env.API_NINJAS_KEY || '',
        blockDisposable: true,
      },
    }),
  ],
})
export class AppModule {}
```

## Usage

### With Decorator and Guard

```typescript
import { ValidateEmail, EmailValidationGuard } from '@vehicle-watchlist/email-validation';

@Post('register')
@UseGuards(EmailValidationGuard)
@ValidateEmail({ blockDisposable: true })
register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}
```

**Note:** You must use both `@UseGuards(EmailValidationGuard)` and `@ValidateEmail()` together. The decorator sets the configuration metadata, while the guard performs the actual validation.

### Direct Service

```typescript
const result = await emailValidation.validateEmail('user@gmail.com');
console.log(result.isValid, result.isDisposable);
```
