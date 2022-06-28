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
import { GetRiskMapH3Dto } from 'modules/h3-data/dto/get-risk-map.dto';
import {
  H3MapResponse,
  H3DataResponse,
} from 'modules/h3-data/dto/h3-map-response.dto';
import { GetYearsByLayerAndMaterialsDto } from 'modules/h3-data/dto/get-years-by-layer-and-materials.dto';
import { GetImpactMapDto } from 'modules/h3-data/dto/get-impact-map.dto';

@Controller('/api/v1/h3')
@ApiTags(H3Data.name)
@ApiBearerAuth()
export class H3DataController {
  constructor(protected readonly h3DataService: H3DataService) {}

  @ApiOperation({ description: 'Retrieve H3 data providing its name' })
  @ApiOkResponse({ type: H3DataResponse })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Get('data/:h3TableName/:h3ColumnName')
  async findOneByName(
    @Param('h3TableName') h3TableName: string,
    @Param('h3ColumnName') h3ColumnName: string,
  ): Promise<{ data: H3IndexValueData[] }> {
    const h3Data: H3IndexValueData[] = await this.h3DataService.findH3ByName(
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
      await this.h3DataService.getYearsByLayerType(
        layer,
        materialIds,
        indicatorId,
      );
    return { data: availableYears };
  }

  @ApiOperation({ description: 'Get h3 indexes by ID in a given resolution' })
  @ApiQuery({ type: GetMaterialH3ByResolutionDto })
  @ApiOkResponse({
    type: H3MapResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Get('/map/material')
  async getH3ByIdAndResolution(
    @Query(ValidationPipe)
    queryParams: GetMaterialH3ByResolutionDto,
  ): Promise<H3MapResponse> {
    const { materialId, resolution, year } = queryParams;
    return await this.h3DataService.getMaterialMapByResolution(
      materialId,
      resolution,
      year,
    );
  }

  @ApiOperation({
    description:
      'Get a calculated H3 risk map given a Material and a Indicator',
  })
  @ApiOkResponse({
    type: H3MapResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Get('/map/risk')
  async getRiskMap(
    @Query(ValidationPipe) queryParams: GetRiskMapH3Dto,
  ): Promise<H3MapResponse> {
    const { materialId, indicatorId, resolution, year } = queryParams;
    return await this.h3DataService.getRiskMapByResolution(
      materialId,
      indicatorId,
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
    return this.h3DataService.getImpactMapByResolution(getImpactMapDto);
  }
}
