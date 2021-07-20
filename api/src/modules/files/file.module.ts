import { Module } from '@nestjs/common';
import { FileService } from 'modules/files/file.service';
import { XLSXParserService } from 'modules/files/xlsx-parser.service';
import { DataValidationModule } from 'modules/data-validation/data-validation.module';

@Module({
  imports: [DataValidationModule],
  providers: [FileService, XLSXParserService],
  exports: [FileService, XLSXParserService],
})
export class FileModule {}
