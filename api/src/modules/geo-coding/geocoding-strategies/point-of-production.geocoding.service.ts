import { Injectable } from '@nestjs/common';
import { GeoCodingBaseService } from 'modules/geo-coding/geo-coding.base.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { GeocodeResponseData } from '@googlemaps/google-maps-services-js/dist/geocode/geocode';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { QueryRunner } from 'typeorm';

@Injectable()
export class PointOfProductionGeocodingService extends GeoCodingBaseService {
  async geoCodePointOfProduction(
    sourcingData: SourcingData,
    queryRunner?: QueryRunner,
  ): Promise<any> {
    if (!sourcingData.locationCountryInput)
      throw new Error(
        'A country must be provided for Point of Production location type',
      );
    if (this.hasBothAddressAndCoordinates(sourcingData))
      throw new Error(
        `For ${sourcingData.locationCountryInput} coordinates ${sourcingData.locationLatitude} ,${sourcingData.locationLongitude} and address ${sourcingData.locationAddressInput} has been provided. Either and address or coordinates can be provided for a Point of Production Location Type`,
      );

    if (sourcingData.locationLongitude && sourcingData.locationLatitude) {
      const geoRegionId: Pick<GeoRegion, 'id'> =
        await this.geoRegionService.saveGeoRegionAsPoint(
          {
            name: sourcingData.locationCountryInput,
            coordinates: {
              lat: sourcingData.locationLatitude,
              lng: sourcingData.locationLongitude,
            },
          },
          queryRunner,
        );

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
    if (sourcingData.locationAddressInput) {
      const geoCodeResponseData: GeocodeResponseData =
        await this.geoCodeByAddress(sourcingData.locationAddressInput);

      const geoRegionId: Pick<GeoRegion, 'id'> =
        await this.geoRegionService.saveGeoRegionAsPoint(
          {
            name: sourcingData.locationCountryInput,
            coordinates: {
              lat: geoCodeResponseData.results[0].geometry.location.lat,
              lng: geoCodeResponseData.results[0].geometry.location.lng,
            },
          },
          queryRunner,
        );

      const { adminRegionId } =
        await this.adminRegionService.getClosestAdminRegionByCoordinates({
          lng: geoCodeResponseData?.results[0]?.geometry.location.lng,
          lat: geoCodeResponseData?.results[0]?.geometry.location.lat,
        });

      return {
        ...sourcingData,
        adminRegionId,
        geoRegionId,
      };
    }
  }
}
