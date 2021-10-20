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
  Indicator,
  indicatorResource,
} from 'modules/indicators/indicator.entity';
import { CreateIndicatorDto } from 'modules/indicators/dto/create.indicator.dto';
import { UpdateIndicatorDto } from 'modules/indicators/dto/update.indicator.dto';
import { PaginationMeta } from 'utils/app-base.service';

@Controller(`/api/v1/indicators`)
@ApiTags(indicatorResource.className)
export class IndicatorsController {
  constructor(public readonly indicatorsService: IndicatorsService) {}

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

  @ApiOperation({ description: 'Find indicator by id' })
  @ApiOkResponse({ type: Indicator })
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
  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() dto: CreateIndicatorDto): Promise<Indicator> {
    return await this.indicatorsService.serialize(
      await this.indicatorsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a indicator' })
  @ApiOkResponse({ type: Indicator })
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
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.indicatorsService.remove(id);
  }
}
