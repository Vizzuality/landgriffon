import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { SelectQueryBuilder } from 'typeorm';
import { IMPACT_MAP_TYPE } from 'modules/h3-data/h3-data.repository';

export type BaseImpactMap = {
  indicatorId: string;
  resolution: number;
  year: number;
  mapType: IMPACT_MAP_TYPE;
  isRelative?: boolean;
  materialIds?: string[];
  originIds?: string[];
  t1SupplierIds?: string[];
  producerIds?: string[];
  businessUnitIds?: string[];
  locationTypes?: LOCATION_TYPES[];
  baseQueryExtend?: (baseQuery: SelectQueryBuilder<any>) => void;
  scenarioComparisonQuantiles?: boolean;
};
