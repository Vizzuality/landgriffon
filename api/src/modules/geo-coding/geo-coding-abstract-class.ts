import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';

export abstract class GeoCodingAbstractClass {
  abstract geoCodeLocations(
    sourcingData: SourcingData[],
  ): Promise<{ geoCodedSourcingData: SourcingData[]; errors: any[] }>;

  abstract geoCodeSourcingLocation(locationInfo: {
    locationAdminRegionInput?: string;
    locationAddressInput?: string;
    locationLatitude?: number;
    locationLongitude?: number;
    locationCountryInput: string;
    locationType: LOCATION_TYPES;
  }): Promise<SourcingLocation>;
}
