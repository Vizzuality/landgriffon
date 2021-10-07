/**
 * DTO for RiskMap Response
 */
import { H3IndexValueData } from 'modules/h3-data/h3-data.entity';

export class RiskMapResponseDTO {
  indicator: string;
  material: string;
  unit: {
    name: string;
    symbol: string;
  };
  riskMap: H3IndexValueData[];
}
