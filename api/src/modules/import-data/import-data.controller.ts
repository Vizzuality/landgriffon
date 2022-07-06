import {
  Controller,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiConsumesXLSX } from 'decorators/xlsx-upload.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUploadInterceptor } from 'modules/import-data/file-upload.interceptor';
import { XlsxPayloadInterceptor } from 'modules/import-data/xlsx-payload.interceptor';
import { ImportDataService } from 'modules/import-data/import-data.service';
import { Task } from 'modules/tasks/task.entity';
import { GetUser } from 'decorators/get-user.decorator';
import { User } from 'modules/users/user.entity';

@ApiTags('Import Data')
@Controller(`/api/v1/import`)
@ApiBearerAuth()
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
    @GetUser() user: User,
  ): Promise<Partial<Task>> {
    if (!user) {
      throw new UnauthorizedException();
    }
    const userId: string = user.id;
    const task: Task = await this.importDataService.validateAndLoadXlsxFile(
      userId,
      xlsxFile,
    );
    return {
      data: {
        id: task.id,
        createdAt: task.createdAt,
        status: task.status,
        createdBy: task.userId,
      },
    };
  }
}
