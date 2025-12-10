import { Module } from '@nestjs/common';
import { GovIlApiModule } from './gov-il';

@Module({
  imports: [GovIlApiModule],
  controllers: [],
  providers: [],
  exports: [GovIlApiModule],
})
export class ApiModule { }
