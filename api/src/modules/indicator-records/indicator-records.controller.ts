import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
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
  IndicatorRecord,
  indicatorRecordResource,
} from 'modules/indicator-records/indicator-record.entity';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
import { CreateIndicatorRecordDto } from 'modules/indicator-records/dto/create.indicator-record.dto';
import { UpdateIndicatorRecordDto } from 'modules/indicator-records/dto/update.indicator-record.dto';
import { PaginationMeta } from 'utils/app-base.service';

@Controller(`/api/v1/indicator-records`)
@ApiTags(indicatorRecordResource.className)
@ApiBearerAuth()
export class IndicatorRecordsController {
  constructor(
    public readonly indicatorRecordService: IndicatorRecordsService,
  ) {}

  @ApiOperation({
    description: 'Find all indicator records',
  })
  @ApiOkResponse({
    type: IndicatorRecord,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: indicatorRecordResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: indicatorRecordResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<IndicatorRecord> {
    const results: {
      data: (Partial<IndicatorRecord> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.indicatorRecordService.findAllPaginated(fetchSpecification);
    return this.indicatorRecordService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({ description: 'Find indicator record by id' })
  @ApiOkResponse({ type: IndicatorRecord })
  @ApiNotFoundResponse({ description: 'Indicator record not found' })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IndicatorRecord> {
    return await this.indicatorRecordService.serialize(
      await this.indicatorRecordService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a indicator record' })
  @ApiOkResponse({ type: IndicatorRecord })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Post()
  @UsePipes(ValidationPipe)
  async create(
    @Body() dto: CreateIndicatorRecordDto,
  ): Promise<IndicatorRecord> {
    return await this.indicatorRecordService.serialize(
      await this.indicatorRecordService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a indicator record' })
  @ApiNotFoundResponse({ description: 'Indicator record not found' })
  @ApiOkResponse({ type: IndicatorRecord })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateIndicatorRecordDto,
    @Param('id') id: string,
  ): Promise<IndicatorRecord> {
    return await this.indicatorRecordService.serialize(
      await this.indicatorRecordService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a indicator record' })
  @ApiNotFoundResponse({ description: 'Indicator record not found' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.indicatorRecordService.remove(id);
  }
}
