import { Module } from '@nestjs/common';
import { DataValidationService } from 'modules/data-validation/data-validation.service';
import { DtoProcessorService } from 'modules/data-validation/dto-processor.service';

@Module({
  providers: [DataValidationService, DtoProcessorService],
  exports: [DataValidationService, DtoProcessorService],
})
export class DataValidationModule {}
