import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { CreateSourcingLocationV2, GeoCodedSourcingLocation } from 'modules/sourcing-locations/dto/create-sourcing-location-v2.dto';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoCodeResult } from './geo-coding.service-v2';
import { ErrorRecord } from 'modules/tasks/task-report.service';
import { GeocodingRepository } from './strategies_v2/geocoding.repository';

export interface GeoCodingInterface {
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

export interface GeoCodingInterfaceV2 {
  geocode(locations: CreateSourcingLocationV2[]): Promise<GeoCodeResult>

  geoCodeSourcingLocation(locationInfo: {
    locationAdminRegionInput?: string;
    locationAddressInput?: string;
    locationLatitude?: number;
    locationLongitude?: number;
    locationCountryInput: string;
    locationType: LOCATION_TYPES;
  }): Promise<GeoCodedSourcingLocation>;
}
