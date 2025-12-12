import { Module, DynamicModule, Global, Provider, Type } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EmailValidationService } from './email-validation.service';
import { EmailValidationGuard } from './email-validation.guard';
import { EmailValidationModuleOptions } from './email-validation.types';
import {
  EMAIL_VALIDATION_OPTIONS,
  DEFAULT_EMAIL_VALIDATION_OPTIONS,
} from './email-validation.constants';

export interface EmailValidationModuleConfig {
  /**
   * Email validation options
   */
  options: EmailValidationModuleOptions;

  /**
   * Whether to apply the email validation guard globally
   * @default false
   */
  global?: boolean;
}

@Global()
@Module({})
export class EmailValidationModule {
  /**
   * Register email validation with options
   */
  static register(config: EmailValidationModuleConfig): DynamicModule {
    const options: EmailValidationModuleOptions = {
      ...DEFAULT_EMAIL_VALIDATION_OPTIONS,
      ...config.options,
    };

    const providers: Provider[] = [
      {
        provide: EMAIL_VALIDATION_OPTIONS,
        useValue: options,
      },
      EmailValidationService,
      EmailValidationGuard,
    ];

    // Add global guard if enabled
    if (config.global) {
      providers.push({
        provide: APP_GUARD,
        useClass: EmailValidationGuard,
      });
    }

    return {
      module: EmailValidationModule,
      providers,
      exports: [EmailValidationService, EmailValidationGuard],
    };
  }

  /**
   * Register email validation asynchronously
   */
  static registerAsync(options: {
    useFactory: (
      ...args: unknown[]
    ) =>
      | Promise<EmailValidationModuleConfig>
      | EmailValidationModuleConfig;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    inject?: (string | symbol | Function | Type<unknown>)[];
  }): DynamicModule {
    const providers: Provider[] = [
      {
        provide: 'EMAIL_VALIDATION_MODULE_CONFIG',
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      {
        provide: EMAIL_VALIDATION_OPTIONS,
        useFactory: (config: EmailValidationModuleConfig) => ({
          ...DEFAULT_EMAIL_VALIDATION_OPTIONS,
          ...config.options,
        }),
        inject: ['EMAIL_VALIDATION_MODULE_CONFIG'],
      },
      EmailValidationService,
      EmailValidationGuard,
    ];

    return {
      module: EmailValidationModule,
      providers,
      exports: [EmailValidationService, EmailValidationGuard],
    };
  }
}
