import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  JSONAPIQueryParams,
  JSONAPISingleEntityQueryParams,
} from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import {
  SourcingRecord,
  sourcingRecordResource,
} from 'modules/sourcing-records/sourcing-record.entity';
import { CreateSourcingRecordDto } from 'modules/sourcing-records/dto/create.sourcing-record.dto';
import { UpdateSourcingRecordDto } from 'modules/sourcing-records/dto/update.sourcing-record.dto';
import { ApiConsumesXLSX } from 'decorators/xlsx-upload.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUploadInterceptor } from 'modules/files/file-upload.interceptor';
import { XlsxPayloadInterceptor } from 'modules/files/xlsx-payload.interceptor';

@Controller(`/api/v1/sourcing-records`)
@ApiTags(sourcingRecordResource.className)
export class SourcingRecordsController {
  constructor(public readonly sourcingRecordsService: SourcingRecordsService) {}

  @ApiOperation({
    description: 'Find all sourcing groups',
  })
  @ApiOkResponse({
    type: SourcingRecord,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<SourcingRecord> {
    const results = await this.sourcingRecordsService.findAllPaginated(
      fetchSpecification,
    );
    return this.sourcingRecordsService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({ description: 'Find sourcing group by id' })
  @ApiOkResponse({ type: SourcingRecord })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SourcingRecord> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a sourcing group' })
  @ApiOkResponse({ type: SourcingRecord })
  @Post()
  async create(@Body() dto: CreateSourcingRecordDto): Promise<SourcingRecord> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a sourcing group' })
  @ApiOkResponse({ type: SourcingRecord })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateSourcingRecordDto,
    @Param('id') id: string,
  ): Promise<SourcingRecord> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a sourcing group' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.sourcingRecordsService.remove(id);
  }

  @ApiConsumesXLSX()
  @UseInterceptors(
    FileInterceptor('file', fileUploadInterceptor),
    XlsxPayloadInterceptor,
  )
  @Post('import')
  async importXLSX(
    @UploadedFile() xlsxFile: Express.Multer.File,
  ): Promise<void> {
    await this.sourcingRecordsService.loadXLSXDataSet(xlsxFile.path);
  }
}
