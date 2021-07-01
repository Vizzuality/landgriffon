import { Module } from '@nestjs/common';
import { FileService } from 'modules/files/file.service';
import { XlsxParser } from 'modules/files/xlsx.parser';

@Module({
  providers: [FileService, XlsxParser],
  exports: [FileService, XlsxParser],
})
export class FileModule {}
