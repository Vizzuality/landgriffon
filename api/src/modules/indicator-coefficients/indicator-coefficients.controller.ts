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
import { IndicatorCoefficientsService } from 'modules/indicator-coefficients/indicator-coefficients.service';
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
  IndicatorCoefficient,
  indicatorCoefficientResource,
} from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { CreateIndicatorCoefficientDto } from 'modules/indicator-coefficients/dto/create.indicator-coefficient.dto';
import { UpdateIndicatorCoefficientDto } from 'modules/indicator-coefficients/dto/update.indicator-coefficient.dto';
import { PaginationMeta } from 'utils/app-base.service';

@Controller(`/api/v1/indicator-coefficients`)
@ApiTags(indicatorCoefficientResource.className)
@ApiBearerAuth()
export class IndicatorCoefficientsController {
  constructor(
    public readonly indicatorCoefficientsService: IndicatorCoefficientsService,
  ) {}

  @ApiOperation({
    description: 'Find all indicator coefficients',
  })
  @ApiOkResponse({
    type: IndicatorCoefficient,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: indicatorCoefficientResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: indicatorCoefficientResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<IndicatorCoefficient> {
    const results: {
      data: (Partial<IndicatorCoefficient> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.indicatorCoefficientsService.findAllPaginated(
      fetchSpecification,
    );
    return this.indicatorCoefficientsService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({ description: 'Find indicator coefficient by id' })
  @ApiOkResponse({ type: IndicatorCoefficient })
  @ApiNotFoundResponse({ description: 'Indicator coefficient not found' })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IndicatorCoefficient> {
    return await this.indicatorCoefficientsService.serialize(
      await this.indicatorCoefficientsService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a indicator coefficient' })
  @ApiOkResponse({ type: IndicatorCoefficient })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Post()
  @UsePipes(ValidationPipe)
  async create(
    @Body() dto: CreateIndicatorCoefficientDto,
  ): Promise<IndicatorCoefficient> {
    return await this.indicatorCoefficientsService.serialize(
      await this.indicatorCoefficientsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a indicator coefficient' })
  @ApiNotFoundResponse({ description: 'Indicator coefficient not found' })
  @ApiOkResponse({ type: IndicatorCoefficient })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateIndicatorCoefficientDto,
    @Param('id') id: string,
  ): Promise<IndicatorCoefficient> {
    return await this.indicatorCoefficientsService.serialize(
      await this.indicatorCoefficientsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a indicator coefficient' })
  @ApiNotFoundResponse({ description: 'Indicator coefficient not found' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.indicatorCoefficientsService.remove(id);
  }
}
