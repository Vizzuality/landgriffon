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
import { IndicatorsService } from 'modules/indicators/indicators.service';
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
  Indicator,
  INDICATOR_TYPES_NEW,
  indicatorResource,
} from 'modules/indicators/indicator.entity';
import { CreateIndicatorDto } from 'modules/indicators/dto/create.indicator.dto';
import { UpdateIndicatorDto } from 'modules/indicators/dto/update.indicator.dto';
import { PaginationMeta } from 'utils/app-base.service';
import { IndicatorDependencyManager } from 'modules/impact/services/indicator-dependency-getter.service';

@Controller(`/api/v1/indicators`)
@ApiTags(indicatorResource.className)
@ApiBearerAuth()
export class IndicatorsController {
  constructor(
    public readonly indicatorsService: IndicatorsService,
    public readonly dependencyGetter: IndicatorDependencyManager,
  ) {}

  @ApiOperation({
    description: 'Find all indicators',
  })
  @ApiOkResponse({
    type: Indicator,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: indicatorResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: indicatorResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<Indicator> {
    const results: {
      data: (Partial<Indicator> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.indicatorsService.findAllPaginated(fetchSpecification);
    return this.indicatorsService.serialize(results.data, results.metadata);
  }
  // TODO: test endpooint. delete
  @Get('test')
  async test(): Promise<any> {
    return this.dependencyGetter.buildQueryForIntervention([
      INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE,
      INDICATOR_TYPES_NEW.WATER_USE,
      INDICATOR_TYPES_NEW.CLIMATE_RISK,
      INDICATOR_TYPES_NEW.LAND_USE,
    ]);
  }

  @ApiOperation({ description: 'Find indicator by id' })
  @ApiOkResponse({ type: Indicator })
  @ApiNotFoundResponse({ description: 'Indicator not found' })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ProcessFetchSpecification({
      allowedFilters: indicatorResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<Indicator> {
    return await this.indicatorsService.serialize(
      await this.indicatorsService.getById(id, fetchSpecification),
    );
  }

  @ApiOperation({ description: 'Create a indicator' })
  @ApiOkResponse({ type: Indicator })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() dto: CreateIndicatorDto): Promise<Indicator> {
    return await this.indicatorsService.serialize(
      await this.indicatorsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a indicator' })
  @ApiOkResponse({ type: Indicator })
  @ApiNotFoundResponse({ description: 'Indicator not found' })
  @UsePipes(ValidationPipe)
  @Patch(':id')
  async update(
    @Body() dto: UpdateIndicatorDto,
    @Param('id') id: string,
  ): Promise<Indicator> {
    return await this.indicatorsService.serialize(
      await this.indicatorsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a indicator' })
  @ApiNotFoundResponse({ description: 'Indicator not found' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.indicatorsService.remove(id);
  }
}
