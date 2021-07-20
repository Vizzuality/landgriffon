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
import { fileUploadInterceptor } from 'modules/files/file-upload.interceptor';
import { XlsxPayloadInterceptor } from 'modules/files/xlsx-payload.interceptor';
import { ImportDataService } from 'modules/import-data/import-data.service';

@ApiTags('Import Data')
@Controller(`/api/v1/import`)
export class ImportDataController {
  constructor(public readonly importDataService: ImportDataService) {}

  @ApiConsumesXLSX()
  @UseInterceptors(
    FileInterceptor(
      'file',
      fileUploadInterceptor({ allowedFileExtension: '.xlsx' }),
    ),
    XlsxPayloadInterceptor,
  )
  @Post('/xlsx')
  async importXLSX(
    @UploadedFile() xlsxFile: Express.Multer.File,
  ): Promise<any> {
    try {
      return await this.importDataService.loadXLSXDataSet(xlsxFile.path);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }
}
