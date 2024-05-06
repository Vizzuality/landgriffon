import {
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiConsumesXLSX } from 'decorators/xlsx-upload.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { XlsxPayloadInterceptor } from 'modules/import-data/xlsx-payload.interceptor';
import { ImportDataService } from 'modules/import-data/import-data.service';
import { Task } from 'modules/tasks/task.entity';
import { GetUser } from 'decorators/get-user.decorator';
import { User } from 'modules/users/user.entity';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { RequiredRoles } from 'decorators/roles.decorator';
import { RolesGuard } from 'guards/roles.guard';
import { EudrImportService } from 'modules/import-data/eudr/eudr.import.service';
import { Public } from 'decorators/public.decorator';
import { ImportProgressEmitter } from 'modules/events/import-data/import-progress.emitter';
import { SourcingDataImportService } from './sourcing-data/sourcing-data-import.service';
import { TasksService } from '../tasks/tasks.service';
import { DataSource } from 'typeorm';

@ApiTags('Import Data')
@Controller(`/api/v1/import`)
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class ImportDataController {
  constructor(
    public readonly importDataService: ImportDataService,
    private readonly eudr: EudrImportService,
    private readonly importProgressEmitter: ImportProgressEmitter,
    // TODO: for testing purposes, remove this dependency
    private readonly sourcingDataImportService: SourcingDataImportService,
    private readonly dataSource: DataSource,
  ) {}

  @ApiConsumesXLSX()
  @ApiBadRequestResponse({
    description:
      'Bad Request. A .XLSX file not provided as payload or contains missing or incorrect data',
  })
  @ApiForbiddenResponse()
  @UseInterceptors(FileInterceptor('file'), XlsxPayloadInterceptor)
  @RequiredRoles(ROLES.ADMIN)
  @Post('/sourcing-data')
  async importSourcingRecords(
    @UploadedFile() xlsxFile: Express.Multer.File,
    @GetUser() user: User,
  ): Promise<Partial<Task>> {
    if (!user) {
      throw new UnauthorizedException();
    }
    const userId: string = user.id;
    const task: Task = await this.importDataService.loadXlsxFile(
      userId,
      xlsxFile,
    );
    return task;
  }

  // @ApiConsumesXLSX()
  // @ApiBadRequestResponse({
  //   description:
  //     'Bad Request. A .XLSX file not provided as payload or contains missing or incorrect data',
  // })
  // @ApiForbiddenResponse()
  // @UseInterceptors(FileInterceptor('file'), XlsxPayloadInterceptor)
  // @RequiredRoles(ROLES.ADMIN)
  // @Post('/eudr')
  // async importEudr(
  //   @UploadedFile() xlsxFile: Express.Multer.File,
  //   @GetUser() user: User,
  // ): Promise<Partial<Task>> {
  //   const { path } = xlsxFile;
  //   const taskId: string = 'fa02307f-70f1-4c8a-a117-2a7cfd6f0be5';
  //
  //   return this.eudr.importEudr(path, taskId);
  // }

  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }
  //   const userId: string = user.id;
  //   const task: Task = await this.importDataService.loadXlsxFile(
  //     userId,
  //     xlsxFile,
  //   );
  //   return {
  //     data: {
  //       id: task.id,
  //       createdAt: task.createdAt,
  //       status: task.status,
  //       createdBy: task.userId,
  //     },
  //   };
  // }
}
