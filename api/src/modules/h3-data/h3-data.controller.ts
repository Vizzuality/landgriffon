import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { H3Data, H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { GetMaterialH3ByResolutionDto } from 'modules/h3-data/dto/get-material-h3-by-resolution.dto';
import { GetRiskMapH3Dto } from 'modules/h3-data/dto/get-risk-map.dto';
import { H3MapResponse } from 'modules/h3-data/dto/h3-map-response.dto';
import { GetYearsByLayerAndMaterialDto } from 'modules/h3-data/dto/get-years-by-layer-and-material.dto';
import { GetImpactMapDto } from 'modules/h3-data/dto/get-impact-map.dto';
import { GetImpactTableDto } from 'modules/h3-data/dto/get-impact-table.dto';
import { ImpactTableService } from 'modules/h3-data/services/impact-table.service';

@Controller('/api/v1/h3')
@ApiTags(H3Data.name)
export class H3DataController {
  constructor(
    protected readonly h3DataService: H3DataService,
    protected readonly impactTableService: ImpactTableService,
  ) {}

  @ApiOperation({ description: 'Retrieve H3 data providing its name' })
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
  @Get('years')
  async getYearsByLayerType(
    @Query(ValidationPipe) queryParams: GetYearsByLayerAndMaterialDto,
  ): Promise<{ data: number[] }> {
    const { materialId, indicatorId, layer } = queryParams;
    const availableYears: number[] = await this.h3DataService.getYearsByLayerType(
      layer,
      materialId,
      indicatorId,
    );
    return { data: availableYears };
  }

  @ApiOperation({ description: 'Get h3 indexes by ID in a given resolution' })
  @ApiQuery({ type: GetMaterialH3ByResolutionDto })
  @Get('material')
  async getH3ByIdAndResolution(
    @Query(ValidationPipe)
    queryParams: GetMaterialH3ByResolutionDto,
  ): Promise<H3MapResponse> {
    const { materialId, resolution } = queryParams;
    return await this.h3DataService.getMaterialMapByResolution(
      materialId,
      resolution,
    );
  }

  @ApiOperation({
    description:
      'Get a calculated H3 risk map given a Material and a Indicator',
  })
  @Get('risk-map')
  async getRiskMap(
    @Query(ValidationPipe) queryParams: GetRiskMapH3Dto,
  ): Promise<H3MapResponse> {
    const { materialId, indicatorId, resolution } = queryParams;
    return await this.h3DataService.getRiskMapByResolution(
      materialId,
      indicatorId,
      resolution,
    );
  }

  /**
   * TODO: complete docs
   *
   * @param getImpactMapDto
   */
  @ApiOperation({
    description: 'Get a calculated H3 impact map given ...',
  })
  @Get('impact-map')
  async getImpactMap(
    @Query(ValidationPipe) getImpactMapDto: GetImpactMapDto,
  ): Promise<H3MapResponse> {
    return this.h3DataService.getImpactMapByResolution(getImpactMapDto);
  }

  @ApiOperation({
    description: 'Get a calculated H3 impact map given ...',
  })
  @Get('impact-table')
  async getImpactTable(
    @Query(ValidationPipe) getImpactTableDto: GetImpactTableDto,
  ): Promise<H3MapResponse> {
    console.log(getImpactTableDto);
    return this.impactTableService.getImpactTable(getImpactTableDto);
  }
}
