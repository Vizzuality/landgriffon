import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';
import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from '../geo-coding.service-v2';
import { CacheGeocoder } from '../geocoders/cache.geocoder';
import { IGeoCodingStrategy } from './geo-coding.strategy.interface';
import { GeocodingRepository } from './geocoding.repository';

export class AggregationPointGeocodingStrategy implements IGeoCodingStrategy {
  constructor(
    private geoCodingRepo: GeocodingRepository,
    private geocoder: CacheGeocoder
  ) { }

  async geoCodeLocation(location: SourcingLocationInfo,): Promise<GeoCodedLocation> {
    const {
      locationAddressInput,
      locationCountryInput,
      locationLatitude,
      locationLongitude
    } = location;

    /**
     * The user must specify a country, and either an address OR coordinates
     */
    if (this.hasBothAddressAndCoordinates(location)) {
      throw new GeoCodingError(
        `For ${locationCountryInput} coordinates ${locationLatitude} ,${locationLongitude} and address ${locationAddressInput} has been provided. Either and address or coordinates can be provided for a Aggregation Point Location Type`,
      );
    }

    /**
     * If coordinates, create a new geo-region: a 50KM radius around the given point
     */
    if (locationLatitude && locationLongitude) {
      // Do the two of them at the same time
      const [geoRegion, adminRegion] = await Promise.all([
        await this.geoCodingRepo.saveGeoRegionAsRadius({ locationLatitude, locationLongitude }),
        await this.geoCodingRepo.getClosestAdminRegionByCoordinates(location)
      ]);

      return { adminRegion, geoRegion };
    }
    /**
     * if address, geocode the address
     */
    if (locationAddressInput) {
      const result = await this.geocoder.geoCodeByAddress(locationAddressInput, locationCountryInput);

      const { types, geometry } = result.data.results[0];
      const locationLatitude = geometry.location.lat;
      const locationLongitude = geometry.location.lng;
      const latLon = { locationLongitude, locationLatitude };
      const sourceLocationInfo: SourcingLocationInfo = { ...location, ...latLon };

      /**
       * if given address is country type, raise and exception. it should be an address within a country
       */
      if (this.isAddressACountry(types)) {
        throw new GeoCodingError(`${locationAddressInput} is a country, should be an address within a country`);
      }

      /**
       * if address is a level 1 admin-area, intersect the geocoding resultant coordinates to confirm which admin-area belongs to
       */
      let adminRegionLevel: 1 | 2 | null = null;
      if (this.isAddressAdminLevel1(types)) adminRegionLevel = 1;
      if (this.isAddressAdminLevel2(types)) adminRegionLevel = 2;

      if (adminRegionLevel != null) {
        const { adminRegion, geoRegion } =
          await this.geoCodingRepo.getAdminRegionAndGeoRegionByCoordinatesAndLevel(
            sourceLocationInfo,
            adminRegionLevel,
          );

        return { adminRegion, geoRegion };
      }

      /**
       * Else, follow the same logics as coordinates
       * If it's neither AdminRegion Level 1 nor Level 2,
       * should be a GADM Level 0, which we can look it up in the db
       * by its name
       *
       * Get closest AdminRegion given the same point
       */
      const [geoRegion, adminRegion] = await Promise.all([
        this.geoCodingRepo.saveGeoRegionAsRadius(latLon),
        this.geoCodingRepo.getClosestAdminRegionByCoordinates(sourceLocationInfo)
      ]);

      return { adminRegion, geoRegion };

    } else {
      throw new GeoCodingError(
        'Invalid input: locationInfo must include either coordinates or an address with a country',
      );
    }
  }

  hasBothAddressAndCoordinates(sourcingData: SourcingLocationInfo): boolean {
    return !!(
      sourcingData.locationAddressInput && sourcingData.locationLatitude
    );
  }

  isAddressACountry(locationTypes: string[]): boolean {
    return locationTypes.includes('country');
  }

  isAddressAdminLevel1(locationTypes: string[]): boolean {
    return locationTypes.includes('administrative_area_level_1');
  }

  isAddressAdminLevel2(locationTypes: string[]): boolean {
    return locationTypes.includes('administrative_area_level_2');
  }
}
