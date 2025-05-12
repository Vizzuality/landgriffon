import { GeocodeResponse } from 'modules/geo-coding/geocoders/geocoder.interface';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';
import { IGeoCodingStrategy } from './geo-coding.strategy.interface';
import { GeocoderService } from '../geocoders/geocoder.service';
import { GeocodingRepository } from './geocoding.repository';
import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from '../geo-coding.service-v2';

export class AggregationPointGeocodingStrategy implements IGeoCodingStrategy {
  geoCodingRepo: GeocodingRepository;
  geocoder: GeocoderService;

  constructor(geoCodingRepo: GeocodingRepository, geocoder: GeocoderService) {
    this.geoCodingRepo = geoCodingRepo;
    this.geocoder = geocoder;
  }

  async geoCodeLocation(
    location: SourcingLocationInfo,
  ): Promise<GeoCodedLocation> {
    /**
     * The user must specify a country, and either an address OR coordinates
     */
    if (this.hasBothAddressAndCoordinates(location))
      throw new GeoCodingError(
        `For ${location.locationCountryInput} coordinates ${location.locationLatitude} ,${location.locationLongitude} and address ${location.locationAddressInput} has been provided. Either and address or coordinates can be provided for a Aggregation Point Location Type`,
      );

    /**
     * If coordinates, create a new geo-region: a 50KM radius around the given point
     */
    if (location.locationLatitude && location.locationLongitude) {
      const geoRegion = await this.geoCodingRepo.saveGeoRegionAsRadius({
        lat: location.locationLatitude,
        lng: location.locationLongitude,
      });

      const adminRegion =
        await this.geoCodingRepo.getClosestAdminRegionByCoordinates(location);

      return {
        adminRegion,
        geoRegion,
      };
    }
    /**
     * if address, geocode the address
     */
    if (location.locationAddressInput) {
      const geocodedResponseData: {
        data: GeocodeResponse;
        warning: string | undefined;
      } = await this.geocoder.geoCodeByAddress(
        location.locationAddressInput,
        location.locationCountryInput,
      );

      /**
       * if given address is country type, raise and exception. it should be an address within a country
       */
      if (this.isAddressACountry(geocodedResponseData.data.results[0].types))
        throw new GeoCodingError(
          `${location.locationAddressInput} is a country, should be an address within a country
          `,
        );
      /**
       * if address is a level 1 admin-area, intersect the geocoding resultant coordinates to confirm which admin-area belongs to
       */
      if (
        this.isAddressAdminLevel1(geocodedResponseData.data.results[0].types)
      ) {
        const adminRegionLevel = 1;
        const { adminRegion, geoRegion } =
          await this.geoCodingRepo.getAdminRegionAndGeoRegionByCoordinatesAndLevel(
            {
              ...location,
              locationLongitude:
                geocodedResponseData?.data.results[0]?.geometry.location.lng,
              locationLatitude:
                geocodedResponseData?.data.results[0]?.geometry.location.lat,
            },
            adminRegionLevel,
          );
        return {
          adminRegion,
          geoRegion,
        };
      }
      if (
        this.isAddressAdminLevel2(geocodedResponseData.data.results[0].types)
      ) {
        const adminRegionLevel = 2;
        const { adminRegion, geoRegion } =
          await this.geoCodingRepo.getAdminRegionAndGeoRegionByCoordinatesAndLevel(
            {
              ...location,
              locationLongitude:
                geocodedResponseData?.data.results[0]?.geometry.location.lng,
              locationLatitude:
                geocodedResponseData?.data.results[0]?.geometry.location.lat,
            },
            adminRegionLevel,
          );
        return {
          adminRegion,
          geoRegion,
        };
      } else {
        /**
         * Else, follow the same logics as coordinates
         * If it's neither AdminRegion Level 1 nor Level 2, should be a GADM Level 0, which we can look it up in the db
         * by its name
         */
        const geoRegion = await this.geoCodingRepo.saveGeoRegionAsRadius({
          lat: geocodedResponseData.data.results[0].geometry.location.lat,
          lng: geocodedResponseData.data.results[0].geometry.location.lng,
        });
        /**
         * Get closest AdminRegion given the same point
         */
        const adminRegion =
          await this.geoCodingRepo.getClosestAdminRegionByCoordinates({
            ...location,
            locationLongitude:
              geocodedResponseData?.data?.results[0]?.geometry.location.lng,
            locationLatitude:
              geocodedResponseData?.data?.results[0]?.geometry.location.lat,
          });

        return {
          adminRegion,
          geoRegion,
        };
      }
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
