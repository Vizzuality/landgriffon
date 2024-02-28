import { CommonEUDRFiltersDTO } from 'utils/base.query-builder';

export class GetEUDRGeoRegions extends CommonEUDRFiltersDTO {
  withSourcingLocations!: boolean;
}
