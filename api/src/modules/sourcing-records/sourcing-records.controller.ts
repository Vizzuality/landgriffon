import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
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
import { PaginationMeta } from 'utils/app-base.service';
import { SetUserInterceptor } from 'decorators/set-user.interceptor';

@Controller(`/api/v1/sourcing-records`)
@ApiTags(sourcingRecordResource.className)
@ApiBearerAuth()
export class SourcingRecordsController {
  constructor(public readonly sourcingRecordsService: SourcingRecordsService) {}

  @ApiOperation({
    description: 'Find all sourcing record',
  })
  @ApiOkResponse({
    type: SourcingRecord,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: sourcingRecordResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: sourcingRecordResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<SourcingRecord> {
    const results: {
      data: (Partial<SourcingRecord> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.sourcingRecordsService.findAllPaginated(fetchSpecification);
    return this.sourcingRecordsService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({
    description: 'Find years associated with existing sourcing records',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          description: 'List of years',
          type: 'array',
          items: {
            type: 'integer',
            example: 2021,
          },
        },
      },
    },
  })
  @Get('/years')
  async getYears(): Promise<{ data: number[] }> {
    const years: number[] = await this.sourcingRecordsService.getYears();
    return { data: years };
  }

  @ApiOperation({ description: 'Find sourcing record by id' })
  @ApiOkResponse({ type: SourcingRecord })
  @ApiNotFoundResponse({ description: 'Sourcing record not found' })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(
    @ProcessFetchSpecification({
      allowedFilters: sourcingRecordResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
    @Param('id') id: string,
  ): Promise<SourcingRecord> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.getById(id, fetchSpecification),
    );
  }

  @ApiOperation({ description: 'Create a sourcing record' })
  @ApiOkResponse({ type: SourcingRecord })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() dto: CreateSourcingRecordDto): Promise<SourcingRecord> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a sourcing record' })
  @ApiOkResponse({ type: SourcingRecord })
  @ApiNotFoundResponse({ description: 'Sourcing record not found' })
  @UseInterceptors(SetUserInterceptor)
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateSourcingRecordDto,
    @Param('id') id: string,
  ): Promise<SourcingRecord> {
    return await this.sourcingRecordsService.serialize(
      await this.sourcingRecordsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a sourcing record' })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: 'Sourcing record not found' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.sourcingRecordsService.remove(id);
  }
}
