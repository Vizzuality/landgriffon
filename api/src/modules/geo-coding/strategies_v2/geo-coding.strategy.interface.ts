import {
  CreateSourcingLocationV2,
  GeoCodedSourcingLocation,
} from '../../sourcing-locations/dto/create-sourcing-location-v2.dto';
import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from '../geo-coding.service-v2';

export interface IGeoCodingStrategy {
  geoCodeLocation(
    sourcingLocation: SourcingLocationInfo,
  ): Promise<GeoCodedLocation>;
}
