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

  rawDeforestation: number;
  rawBiodiversity: number;
  rawCarbon: number;
  rawWater: number;

  materialH3DataId: string;
}
