/**
 * @description: Interface for typing the response of the DB that retrieves existing sourcing info with
 * total production, harvest, and raw indicator data, used for calculating a indicator-record
 */

export class SourcingRecordsWithIndicatorRawDataDtoV2 {
  sourcingRecordId: string;
  tonnage: number;
  year: number;

  sourcingLocationId: string;
  production: number;
  harvestedArea: number;

  // new
  weightedAllHarvest: number;
  //new
  waterStressPerct: number;

  rawDeforestation: number;
  rawCarbon: number;
  rawWater: number;

  materialH3DataId: string;
}

export class IndicatorRawDataBySourcingRecord {
  production: number;
  harvestedArea: number;

  // new
  weightedAllHarvest: number;
  //new
  waterStressPerct: number;

  rawDeforestation: number;
  rawCarbon: number;
  rawWater: number;
}

// TODO: Delete below class once new methodology is validated
export class SourcingRecordsWithIndicatorRawDataDto {
  sourcingRecordId: string;
  tonnage: number;
  year: number;

  sourcingLocationId: string;
  production: number;
  harvestedArea: number;

  rawDeforestation: number;
  rawBiodiversity: number;
  rawCarbon: number;
  rawWater: number;

  materialH3DataId: string;
}
