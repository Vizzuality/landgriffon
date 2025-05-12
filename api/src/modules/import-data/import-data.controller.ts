import {
  Controller,
  Get,
  Post,
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
import { DataSource } from 'typeorm';
import { Public } from 'decorators/public.decorator';

@ApiTags('Import Data')
@Controller(`/api/v1/import`)
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class ImportDataController {
  constructor(
    public readonly importDataService: ImportDataService,
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

  @Public()
  @Get('/test')
  async test() {
    const selectQuery = this.dataSource
      .createQueryBuilder()
      .select(`hashtext(concat($3::text, points.radius))`, 'name')
      .addSelect(`points.radius`, 'theGeom')
      .addSelect(`array(SELECT h3_polyfill(points.radius,6))`, 'h3Flat')
      .addSelect(
        `cardinality(array(SELECT h3_polyfill(points.radius,6)))`,
        'h3FlatLength',
      )
      .addSelect(
        `array(
        SELECT h3_compact(array(SELECT h3_polyfill(points.radius,6)))
      )`,
        'h3Compact',
      )
      .from('points', 'points');

    const coordinates = {
      lng: 40.758896,
      lat: -73.98513,
    };

    console.log(selectQuery.getSql());

    const result = await this.dataSource.query(
      `
        WITH points AS (SELECT ST_BUFFER(ST_SetSRID(ST_POINT($1, $2), 4326)::geometry, 0.5) as radius)
        INSERT
        INTO geo_region (name, "theGeom", "h3Flat", "h3FlatLength", "h3Compact")
        ${selectQuery.getSql()}
        ON CONFLICT (name) DO
        UPDATE
          SET "theGeom" = excluded."theGeom",
          "h3Compact" = excluded."h3Compact"
          RETURNING *
      `,
      [
        coordinates.lng, // $1
        coordinates.lat, // $2
        `${coordinates.lng}-${coordinates.lat}, radius - `, // :hashText
      ],
    );

    return result[0];
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
