import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

export abstract class GeoCodingAbstractClass {
  abstract geoCodeLocations(
    sourcingData: SourcingData[],
  ): Promise<SourcingData[]>;

  abstract geoCodeSourcingLocation(locationInfo: {
    locationAddressInput?: string;
    locationLatitude?: number;
    locationLongitude?: number;
    locationCountryInput: string;
  }): Promise<SourcingLocation>;
}
