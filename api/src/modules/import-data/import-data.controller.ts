import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiTags } from '@nestjs/swagger';
import { ApiConsumesXLSX } from 'decorators/xlsx-upload.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUploadInterceptor } from 'modules/import-data/file-upload.interceptor';
import { XlsxPayloadInterceptor } from 'modules/import-data/xlsx-payload.interceptor';
import { ImportDataService } from 'modules/import-data/import-data.service';
import { Task } from 'modules/tasks/task.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('Import Data')
@UseGuards(JwtAuthGuard)
@Controller(`/api/v1/import`)
export class ImportDataController {
  constructor(public readonly importDataService: ImportDataService) {}

  @ApiConsumesXLSX()
  @ApiBadRequestResponse({
    description:
      'Bad Request. A .XLSX file not provided as payload or contains missing or incorrect data',
  })
  @UseInterceptors(
    FileInterceptor(
      'file',
      fileUploadInterceptor({ allowedFileExtension: '.xlsx' }),
    ),
    XlsxPayloadInterceptor,
  )
  @Post('/sourcing-data')
  async importSourcingRecords(
    @UploadedFile() xlsxFile: Express.Multer.File,
  ): Promise<Partial<Task>> {
    // TODO: Add userId once auth is in place
    const userId: string = '2a833cc7-5a6f-492d-9a60-0d6d056923ea';
    const task: Task = await this.importDataService.loadXlsxFile(
      userId,
      xlsxFile,
    );
    return {
      data: { id: task.id, createdAt: task.createdBy, status: task.status },
    };
  }
}
