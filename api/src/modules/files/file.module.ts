import { Module } from '@nestjs/common';
import { FileService } from 'modules/files/file.service';
import { XLSXParserService } from 'modules/files/xlsx-parser.service';
import { MaterialsModule } from 'modules/materials/materials.module';

@Module({
  imports: [MaterialsModule],
  providers: [FileService, XLSXParserService],
  exports: [FileService, XLSXParserService],
})
export class FileModule {}
