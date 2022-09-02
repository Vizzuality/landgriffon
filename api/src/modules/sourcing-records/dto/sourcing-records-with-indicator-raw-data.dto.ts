import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';

/**
 * @description: Interface for typing the response of the DB that retrieves existing sourcing info with
 * total production, harvest, and raw indicator data, used for calculating a indicator-record
 */

export class SourcingRecordsWithIndicatorRawDataDto {
  sourcingRecordId: string;
  tonnage: number;
  year: number;

  sourcingLocationId: string;
  production: number;
  harvestedArea: number;

  // TODO remove this hardcoded fields once the "simpleImportCalculations" feature has been tested/approved
  rawDeforestation: number;
  rawBiodiversity: number;
  rawCarbon: number;
  rawWater: number;

  indicatorValues: Map<INDICATOR_TYPES, number>;

  materialH3DataId: string;
}
