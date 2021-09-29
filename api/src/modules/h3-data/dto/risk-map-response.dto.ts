/**
 * DTO for RiskMap Response
 */
import { H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { Unit } from 'modules/units/unit.entity';

export class H3MapResponse {
  data: H3IndexValueData[];
  metadata: { unit: Unit; quantiles?: number[] };
}
