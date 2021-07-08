import { Module } from '@nestjs/common';
import { FileService } from 'modules/files/file.service';
import { XlsxParserService } from 'modules/files/xlsx-parser.service';

@Module({
  providers: [FileService, XlsxParserService],
  exports: [FileService, XlsxParserService],
})
export class FileModule {}
