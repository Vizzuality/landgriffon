import { Injectable } from '@nestjs/common';
import { GeoCodingBaseService } from 'modules/geo-coding/geo-coding.base.service';
import { SourcingData } from 'modules/import-data/sourcing-records/dto-processor.service';
import { GeocodeResponseData } from '@googlemaps/google-maps-services-js/dist/geocode/geocode';

@Injectable()
export class AggregationPointGeocodingService extends GeoCodingBaseService {
  async geoCodeAggregationPoint(sourcingData: SourcingData): Promise<any> {
    /**
     * The user must specify a country, and either an address OR coordinates
     */
    if (sourcingData.locationAddressInput && sourcingData.locationLatitude)
      throw new Error(
        `For ${sourcingData.locationCountryInput} coordenates ${sourcingData.locationLatitude} ,${sourcingData.locationLongitude} and address ${sourcingData.locationAddressInput} has been provided. Either and address or coordinates can be provided for a Aggregation Point Location Type`,
      );

    /**
     * If coordinates, create a new geo-region: a 50KM radius around the given point
     */
    if (sourcingData.locationLatitude && sourcingData.locationLongitude) {
      const geoRegionId = await this.geoRegionService.saveGeoRegionAsRadius({
        name: sourcingData.locationCountryInput,
        coordinates: {
          lat: sourcingData.locationLatitude,
          lng: sourcingData.locationLongitude,
        },
      });
      /**
       *  We just know the country so get the admin-region by its name
       */
      const adminRegion = await this.adminRegionService.getAdminRegionByName(
        sourcingData.locationCountryInput as string,
      );
      return await this.sourcingLocationService.save({
        ...sourcingData,
        adminRegionId: adminRegion.id,
        geoRegionId,
      });
    }
    /**
     * if address, geocode the address
     */
    if (sourcingData.locationAddressInput) {
      const geocodedResponsedata: GeocodeResponseData = await this.geoCodeByAddress(
        sourcingData.locationAddressInput,
      );
      /**
       * if given address is country type, raise and exception. it should be an address within a country
       */
      if (this.isAddressAContry(geocodedResponsedata.results[0].types))
        throw new Error(
          `${sourcingData.locationAddressInput} is a Country, should be an address within a Country`,
        );
      /**
       * if address is a level 1 admin-area, intersect the geocoding resultant coordinates to confirm which admin-area belongs to
       */
      if (this.isAddressAdminLevel1(geocodedResponsedata.results[0].types)) {
        const {
          adminRegionId,
          geoRegionId,
        } = await this.adminRegionService.getAdminRegionIdByCoordinates({
          lng: geocodedResponsedata?.results[0]?.geometry.location.lng,
          lat: geocodedResponsedata?.results[0]?.geometry.location.lat,
        });
        const sourcingLocation = await this.sourcingLocationService.save({
          ...sourcingData,
          adminRegionId,
          geoRegionId,
        });
        return sourcingLocation;
      } else {
        /**
         * Else, follow the same logics as coordinates
         */
        const geoRegionId = await this.geoRegionService.saveGeoRegionAsRadius({
          name: sourcingData.locationCountryInput,
          coordinates: {
            lat: geocodedResponsedata.results[0].geometry.location.lat,
            lng: geocodedResponsedata.results[0].geometry.location.lng,
          },
        });
        const adminRegion = await this.adminRegionService.getAdminRegionByName(
          sourcingData.locationCountryInput as string,
        );
        const sourcingLocation = await this.sourcingLocationService.save({
          ...sourcingData,
          adminRegionId: adminRegion.id,
          geoRegionId,
        });
        return sourcingLocation;
      }
    }
  }
}
