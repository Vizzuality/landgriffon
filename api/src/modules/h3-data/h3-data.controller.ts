import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { H3Data, H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { GetMaterialH3ByResolutionDto } from 'modules/h3-data/dto/get-material-h3-by-resolution.dto';
import {
  H3MapResponse,
  H3DataResponse,
} from 'modules/h3-data/dto/h3-map-response.dto';
import { GetYearsByLayerAndMaterialsDto } from 'modules/h3-data/dto/get-years-by-layer-and-materials.dto';
import {
  GetActualVsScenarioImpactMapDto,
  GetImpactMapDto,
  GetScenarioVsScenarioImpactMapDto,
} from 'modules/h3-data/dto/get-impact-map.dto';
import { H3DataMapService } from 'modules/h3-data/h3-data-map.service';

@Controller('/api/v1/h3')
@ApiTags(H3Data.name)
@ApiBearerAuth()
export class H3DataController {
  constructor(
    protected readonly h3DataService: H3DataService,
    protected readonly h3DataMapService: H3DataMapService,
  ) {}

  @ApiOperation({ description: 'Retrieve H3 data providing its name' })
  @ApiOkResponse({ type: H3DataResponse })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Get('data/:h3TableName/:h3ColumnName')
  async getH3ByName(
    @Param('h3TableName') h3TableName: string,
    @Param('h3ColumnName') h3ColumnName: string,
  ): Promise<{ data: H3IndexValueData[] }> {
    const h3Data: H3IndexValueData[] = await this.h3DataService.getH3ByName(
      h3TableName,
      h3ColumnName,
    );
    return { data: h3Data };
  }
  @ApiOperation({
    description: 'Retrieve years for which there is data, by layer',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'integer',
            example: 2021,
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Get('years')
  async getYearsByLayerType(
    @Query(ValidationPipe) queryParams: GetYearsByLayerAndMaterialsDto,
  ): Promise<{ data: number[] }> {
    const { materialIds, indicatorId, layer } = queryParams;
    const availableYears: number[] =
      await this.h3DataService.getAvailableYearsByLayerType(
        layer,
        materialIds,
        indicatorId,
      );
    return { data: availableYears };
  }

  @ApiOperation({
    description: 'Get a Material map of h3 indexes by ID in a given resolution',
  })
  @ApiQuery({ type: GetMaterialH3ByResolutionDto })
  @ApiOkResponse({
    type: H3MapResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Get('/map/material')
  async getMaterialMap(
    @Query(ValidationPipe)
    queryParams: GetMaterialH3ByResolutionDto,
  ): Promise<H3MapResponse> {
    const { materialId, resolution, year } = queryParams;
    return await this.h3DataMapService.getMaterialMapByResolutionAndYear(
      materialId,
      resolution,
      year,
    );
  }

  @ApiOperation({
    description:
      'Get a calculated H3 impact map given an Indicator, Year and Resolution',
  })
  @ApiOkResponse({
    type: H3MapResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Get('/map/impact')
  async getImpactMap(
    @Query(ValidationPipe) getImpactMapDto: GetImpactMapDto,
  ): Promise<H3MapResponse> {
    return this.h3DataMapService.getImpactMapByResolution(getImpactMapDto);
  }

  @ApiOperation({
    description:
      'Get a calculated H3 impact map given an Indicator, Year and Resolution comparing the actual data against the given Scenario. ' +
      ' The resulting map will contain the difference between the actual data and the given scenario data plus actual data',
  })
  @ApiOkResponse({
    type: H3MapResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Get('/map/impact/compare/actual/vs/scenario')
  async getImpactActualVsScenarioComparisonMap(
    @Query(ValidationPipe) dto: GetActualVsScenarioImpactMapDto,
  ): Promise<H3MapResponse> {
    return this.h3DataMapService.getImpactMapByResolution(dto);
  }

  @ApiOperation({
    description:
      'Get a calculated H3 impact map given an Indicator, Year and Resolution comparing the given Scenario against another Scenario. ' +
      ' The resulting map will contain the difference between actual data and the given base scenario data, minus the actual data and the compared Scenario',
  })
  @ApiOkResponse({
    type: H3MapResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Get('/map/impact/compare/scenario/vs/scenario')
  async getImpactScenarioVsScenarioComparisonMap(
    @Query(ValidationPipe) dto: GetScenarioVsScenarioImpactMapDto,
  ): Promise<H3MapResponse> {
    return this.h3DataMapService.getImpactMapByResolution(dto);
  }
}
