import { Injectable, Logger } from '@nestjs/common';
import { GeoCodingBaseService } from 'modules/geo-coding/geo-coding.base.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { GeocodeResponseData } from '@googlemaps/google-maps-services-js/dist/geocode/geocode';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';

@Injectable()
export class AggregationPointGeocodingService extends GeoCodingBaseService {
  aggregationPointGeocodingLogger: Logger = new Logger(
    AggregationPointGeocodingService.name,
  );
  async geoCodeAggregationPoint(sourcingData: SourcingData): Promise<any> {
    /**
     * The user must specify a country, and either an address OR coordinates
     */
    if (this.hasBothAddressAndCoordinates(sourcingData))
      throw new Error(
        `For ${sourcingData.locationCountryInput} coordinates ${sourcingData.locationLatitude} ,${sourcingData.locationLongitude} and address ${sourcingData.locationAddressInput} has been provided. Either and address or coordinates can be provided for a Aggregation Point Location Type`,
      );

    /**
     * If coordinates, create a new geo-region: a 50KM radius around the given point
     */
    if (sourcingData.locationLatitude && sourcingData.locationLongitude) {
      const geoRegionId: Pick<GeoRegion, 'id'> =
        await this.geoRegionService.saveGeoRegionAsRadius({
          name: sourcingData.locationCountryInput,
          coordinates: {
            lng: sourcingData.locationLongitude,
            lat: sourcingData.locationLatitude,
          },
        });

      /**
       * Get closest AdminRegion given the same point
       */
      const { adminRegionId } =
        await this.adminRegionService.getClosestAdminRegionByCoordinates({
          lng: sourcingData.locationLongitude,
          lat: sourcingData.locationLatitude,
        });

      return {
        ...sourcingData,
        adminRegionId,
        geoRegionId,
      };
    }
    /**
     * if address, geocode the address
     */
    if (sourcingData.locationAddressInput) {
      const geocodedResponseData: GeocodeResponseData =
        await this.geoCodeByAddress(sourcingData.locationAddressInput);

      /**
       * if given address is country type, raise and exception. it should be an address within a country
       */
      if (this.isAddressACountry(geocodedResponseData.results[0].types))
        throw new Error(
          `${sourcingData.locationAddressInput} is a country, should be an address within a country`,
        );
      /**
       * if address is a level 1 admin-area, intersect the geocoding resultant coordinates to confirm which admin-area belongs to
       */
      if (this.isAddressAdminLevel1(geocodedResponseData.results[0].types)) {
        const { adminRegionId, geoRegionId } =
          await this.adminRegionService.getAdminRegionIdByCoordinatesAndLevel({
            lng: geocodedResponseData?.results[0]?.geometry.location.lng,
            lat: geocodedResponseData?.results[0]?.geometry.location.lat,
            level: 1,
          });
        return {
          ...sourcingData,
          adminRegionId,
          geoRegionId,
        };
      }
      if (this.isAddressAdminLevel2(geocodedResponseData.results[0].types)) {
        const { adminRegionId, geoRegionId } =
          await this.adminRegionService.getAdminRegionIdByCoordinatesAndLevel({
            lng: geocodedResponseData?.results[0]?.geometry.location.lng,
            lat: geocodedResponseData?.results[0]?.geometry.location.lat,
            level: 2,
          });
        return {
          ...sourcingData,
          adminRegionId,
          geoRegionId,
        };
      } else {
        /**
         * Else, follow the same logics as coordinates
         * If it's not neither AdminRegion Level 1 or Level 2, should be a GADM Level 0, which we can look it up in the db
         * by it's name
         */
        const geoRegionId: GeoRegion =
          await this.geoRegionService.saveGeoRegionAsRadius({
            name: sourcingData.locationCountryInput,
            coordinates: {
              lat: geocodedResponseData.results[0].geometry.location.lat,
              lng: geocodedResponseData.results[0].geometry.location.lng,
            },
          });
        /**
         * Get closest AdminRegion given the same point
         */
        const { adminRegionId } =
          await this.adminRegionService.getClosestAdminRegionByCoordinates({
            lng: geocodedResponseData?.results[0]?.geometry.location.lng,
            lat: geocodedResponseData?.results[0]?.geometry.location.lat,
          });

        return {
          ...sourcingData,
          adminRegionId,
          geoRegionId,
        };
      }
    }
  }
}
