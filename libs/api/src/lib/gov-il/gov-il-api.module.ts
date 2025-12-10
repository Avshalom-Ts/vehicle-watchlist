import { Module, Global } from '@nestjs/common';
import { GovIlApiService } from './gov-il-api.service';

@Global()
@Module({
    providers: [GovIlApiService],
    exports: [GovIlApiService],
})
export class GovIlApiModule { }
