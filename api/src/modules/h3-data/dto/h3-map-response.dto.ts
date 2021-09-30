/**
 * DTO for RiskMap Response
 */
import { H3IndexValueData, Quantiles } from 'modules/h3-data/h3-data.entity';

export class H3MapResponse {
  data: H3IndexValueData[];
  metadata: { unit: string; quantiles: Quantiles };
}
