import { Module } from '@nestjs/common';
import { FileService } from 'modules/files/file.service';
import { XLSXParserService } from 'modules/files/xlsx-parser.service';
import { MaterialsModule } from 'modules/materials/materials.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { DataValidationModule } from 'modules/data-validation/data-validation.module';
import { DtoProcessorService } from 'modules/data-validation/dto-processor.service';

@Module({
  imports: [MaterialsModule, BusinessUnitsModule, DataValidationModule],
  providers: [FileService, XLSXParserService, DtoProcessorService],
  exports: [FileService, XLSXParserService],
})
export class FileModule {}
