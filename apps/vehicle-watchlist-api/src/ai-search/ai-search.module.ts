import { Module } from '@nestjs/common';
import { AiSearchController } from './ai-search.controller';
import { AiSearchService } from './ai-search.service';
import { PromptSearchModule } from '@vehicle-watchlist/prompt-search';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
    imports: [
        PromptSearchModule,
        VehiclesModule,
    ],
    controllers: [AiSearchController],
    providers: [AiSearchService],
    exports: [AiSearchService],
})
export class AiSearchModule { }
