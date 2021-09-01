import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RiskMapService } from 'modules/risk-map/risk-map.service';
import { GetRiskMapDto } from 'modules/risk-map/dto/get-risk-map.dto';
import { RiskMapResponseDTO } from 'modules/risk-map/dto/response-risk-map.dto';

@Controller('/api/v1/risk-map')
@ApiTags('Risk Map')
export class RiskMapController {
  constructor(public readonly riskMapService: RiskMapService) {}
  @ApiOperation({
    description: 'Calculate risk-map given a material and indicator IDs',
  })
  @Get('/')
  async getRiskMap(
    @Query(ValidationPipe) queryParams: GetRiskMapDto,
  ): Promise<RiskMapResponseDTO> {
    const { materialId, indicatorId } = queryParams;
    return await this.riskMapService.calculateRiskMapByMaterialAndIndicator(
      materialId,
      indicatorId,
    );
  }
}
