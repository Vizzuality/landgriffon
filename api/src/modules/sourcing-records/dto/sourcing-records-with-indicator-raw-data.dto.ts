/**
 * @description: Interface for typing the response of the DB that retrieves existing sourcing info with
 * total production, harvest, and raw indicator data, used for calculating a indicator-record
 */
import { QueryPropertyTypes } from 'modules/indicator-records/services/impact-calculation.dependencies';

export class SourcingRecordsWithIndicatorRawData extends QueryPropertyTypes {
  sourcingRecordId: string;
  tonnage: number;
  year: number;
  materialH3DataId: string;
  sourcingLocationId: string;
}
