import { Module } from '@nestjs/common';
import { PromptSearchService } from './prompt-search.service';

@Module({
  controllers: [],
  providers: [PromptSearchService],
  exports: [PromptSearchService],
})
export class PromptSearchModule {}
