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
import { IndicatorSourcesService } from 'modules/indicator-sources/indicator-sources.service';
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
  IndicatorSource,
  indicatorSourceResource,
} from 'modules/indicator-sources/indicator-source.entity';
import { CreateIndicatorSourceDto } from 'modules/indicator-sources/dto/create.indicator-source.dto';
import { UpdateIndicatorSourceDto } from 'modules/indicator-sources/dto/update.indicator-source.dto';
import { PaginationMeta } from 'utils/app-base.service';

@Controller(`/api/v1/indicator-sources`)
@ApiTags(indicatorSourceResource.className)
@ApiBearerAuth()
export class IndicatorSourcesController {
  constructor(
    public readonly indicatorSourcesService: IndicatorSourcesService,
  ) {}

  @ApiOperation({
    description: 'Find all indicator sources',
  })
  @ApiOkResponse({
    type: IndicatorSource,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: indicatorSourceResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: indicatorSourceResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<IndicatorSource> {
    const results: {
      data: (Partial<IndicatorSource> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.indicatorSourcesService.findAllPaginated(fetchSpecification);
    return this.indicatorSourcesService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({ description: 'Find indicator source by id' })
  @ApiOkResponse({ type: IndicatorSource })
  @ApiNotFoundResponse({ description: 'Indicator source not found' })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IndicatorSource> {
    return await this.indicatorSourcesService.serialize(
      await this.indicatorSourcesService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a indicator source' })
  @ApiOkResponse({ type: IndicatorSource })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Post()
  @UsePipes(ValidationPipe)
  async create(
    @Body() dto: CreateIndicatorSourceDto,
  ): Promise<IndicatorSource> {
    return await this.indicatorSourcesService.serialize(
      await this.indicatorSourcesService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a indicator source' })
  @ApiNotFoundResponse({ description: 'Indicator source not found' })
  @ApiOkResponse({ type: IndicatorSource })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateIndicatorSourceDto,
    @Param('id') id: string,
  ): Promise<IndicatorSource> {
    return await this.indicatorSourcesService.serialize(
      await this.indicatorSourcesService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a indicator source' })
  @ApiNotFoundResponse({ description: 'Indicator source not found' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.indicatorSourcesService.remove(id);
  }
}
