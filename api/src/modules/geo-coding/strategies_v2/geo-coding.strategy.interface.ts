import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from '../geo-coding.service-v2';

export interface IGeoCodingStrategy {
  geoCodeLocation(sourcingLocation: SourcingLocationInfo): Promise<GeoCodedLocation>;
}
