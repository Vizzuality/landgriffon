import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';

export interface GeoCodingAbstractClass {
  geoCodeLocations(
    sourcingData: SourcingData[],
  ): Promise<{ geoCodedSourcingData: SourcingData[]; errors: any[] }>;

  geoCodeSourcingLocation(locationInfo: {
    locationAdminRegionInput?: string;
    locationAddressInput?: string;
    locationLatitude?: number;
    locationLongitude?: number;
    locationCountryInput: string;
    locationType: LOCATION_TYPES;
  }): Promise<SourcingLocation>;
}
