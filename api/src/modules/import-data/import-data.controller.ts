import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiConsumesXLSX } from 'decorators/xlsx-upload.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUploadInterceptor } from 'modules/import-data/file-upload.interceptor';
import { XlsxPayloadInterceptor } from 'modules/import-data/xlsx-payload.interceptor';
import { SourcingRecordsImportService } from 'modules/import-data/sourcing-records/import.service';

@ApiTags('Import Data')
@Controller(`/api/v1/import`)
export class ImportDataController {
  constructor(
    public readonly importDataService: SourcingRecordsImportService,
  ) {}

  @ApiConsumesXLSX()
  @UseInterceptors(
    FileInterceptor(
      'file',
      fileUploadInterceptor({ allowedFileExtension: '.xlsx' }),
    ),
    XlsxPayloadInterceptor,
  )
  @Post('/sourcing-records')
  async importSourcingRecords(
    @UploadedFile() xlsxFile: Express.Multer.File,
  ): Promise<any> {
    try {
      return await this.importDataService.importSourcingRecords(xlsxFile.path);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }
}
