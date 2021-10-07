import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { H3Data, H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { GetMaterialH3ByResolutionDto } from 'modules/h3-data/dto/get-material-h3-by-resolution.dto';
import { GetRiskMapH3Dto } from 'modules/h3-data/dto/get-risk-map-h3.dto';
import { H3MapResponse } from 'modules/h3-data/dto/h3-map-response.dto';

@Controller('/api/v1/h3')
@ApiTags(H3Data.name)
export class H3DataController {
  constructor(protected readonly h3DataService: H3DataService) {}

  @ApiOperation({ description: 'Retrieve H3 data providing its name' })
  @Get('data/:h3TableName/:h3ColumnName')
  async findOneByName(
    @Param('h3TableName') h3TableName: string,
    @Param('h3ColumnName') h3ColumnName: string,
  ): Promise<{ data: H3IndexValueData[] }> {
    const h3Data = await this.h3DataService.findH3ByName(
      h3TableName,
      h3ColumnName,
    );
    return { data: h3Data };
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
      'Get a calculated H3 Risk-Map given a Material and a Indicator',
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
}
