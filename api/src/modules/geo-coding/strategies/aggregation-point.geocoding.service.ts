import { Injectable, Logger } from '@nestjs/common';
import { BaseStrategy } from 'modules/geo-coding/strategies/base-strategy';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { GeocodeResponse } from 'modules/geo-coding/geocoders/geocoder.interface';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

@Injectable()
export class AggregationPointGeocodingStrategy extends BaseStrategy {
  aggregationPointGeocodingLogger: Logger = new Logger(
    AggregationPointGeocodingStrategy.name,
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
      const geoRegionId: string =
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
      let adminRegionId: string;
      try {
        adminRegionId = (
          await this.adminRegionService.getClosestAdminRegionByCoordinates(
            {
              lng: sourcingData.locationLongitude,
              lat: sourcingData.locationLatitude,
            },
            sourcingData as SourcingLocation,
          )
        ).adminRegionId;
      } catch (e) {
        const existingSourcingLocation: SourcingLocation | undefined =
          await this.findExistingSourcingLocationByGeoRegionId(
            geoRegionId as unknown as string,
          );
        if (!existingSourcingLocation) {
          await this.geoRegionService.remove(geoRegionId as unknown as string);
        }
        throw e;
      }

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
      const geocodedResponseData: {
        data: GeocodeResponse;
        warning: string | undefined;
      } = await this.geoCodeByAddress(
        sourcingData.locationAddressInput,
        sourcingData.locationCountryInput as string,
      );

      /**
       * if given address is country type, raise and exception. it should be an address within a country
       */
      if (this.isAddressACountry(geocodedResponseData.data.results[0].types))
        throw new GeoCodingError(
          `${sourcingData.locationAddressInput} is a country, should be an address within a country
          `,
        );
      /**
       * if address is a level 1 admin-area, intersect the geocoding resultant coordinates to confirm which admin-area belongs to
       */
      if (
        this.isAddressAdminLevel1(geocodedResponseData.data.results[0].types)
      ) {
        const { adminRegionId, geoRegionId } =
          await this.adminRegionService.getAdminRegionIdByCoordinatesAndLevel(
            {
              lng: geocodedResponseData?.data.results[0]?.geometry.location.lng,
              lat: geocodedResponseData?.data.results[0]?.geometry.location.lat,
              level: 1,
            },
            sourcingData as SourcingLocation,
          );
        return {
          ...sourcingData,
          adminRegionId,
          geoRegionId,
        };
      }
      if (
        this.isAddressAdminLevel2(geocodedResponseData.data.results[0].types)
      ) {
        const { adminRegionId, geoRegionId } =
          await this.adminRegionService.getAdminRegionIdByCoordinatesAndLevel(
            {
              lng: geocodedResponseData?.data?.results[0]?.geometry.location
                .lng,
              lat: geocodedResponseData?.data?.results[0]?.geometry.location
                .lat,
              level: 2,
            },
            sourcingData as SourcingLocation,
          );
        return {
          ...sourcingData,
          adminRegionId,
          geoRegionId,
          locationWarning: geocodedResponseData.warning,
        };
      } else {
        /**
         * Else, follow the same logics as coordinates
         * If it's neither AdminRegion Level 1 nor Level 2, should be a GADM Level 0, which we can look it up in the db
         * by its name
         */
        const geoRegionId: string =
          await this.geoRegionService.saveGeoRegionAsRadius({
            name: sourcingData.locationCountryInput,
            coordinates: {
              lat: geocodedResponseData.data.results[0].geometry.location.lat,
              lng: geocodedResponseData.data.results[0].geometry.location.lng,
            },
          });
        /**
         * Get closest AdminRegion given the same point
         */
        const { adminRegionId } =
          await this.adminRegionService.getClosestAdminRegionByCoordinates(
            {
              lng: geocodedResponseData?.data?.results[0]?.geometry.location
                .lng,
              lat: geocodedResponseData?.data?.results[0]?.geometry.location
                .lat,
            },
            sourcingData as SourcingLocation,
          );

        return {
          ...sourcingData,
          adminRegionId,
          geoRegionId,
          locationWarning: geocodedResponseData.warning,
        };
      }
    }
  }
}
