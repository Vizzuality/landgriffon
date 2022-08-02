import { Injectable } from '@nestjs/common';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { BaseStrategy } from 'modules/geo-coding/strategies/base-strategy';
import { GeocodeResponse } from 'modules/geo-coding/geocoders/geocoder.interface';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

@Injectable()
export class PointOfProductionGeocodingStrategy extends BaseStrategy {
  async geoCodePointOfProduction(sourcingData: SourcingData): Promise<any> {
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
        await this.geoRegionService.saveGeoRegionAsPoint({
          name: sourcingData.locationCountryInput,
          coordinates: {
            lat: sourcingData.locationLatitude,
            lng: sourcingData.locationLongitude,
          },
        });
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
        await this.geoRegionService.remove(geoRegionId as unknown as string);
        throw e;
      }

      return {
        ...sourcingData,
        adminRegionId,
        geoRegionId,
      };
    }
    if (
      sourcingData.locationAddressInput &&
      sourcingData.locationCountryInput
    ) {
      const geoCodeResponseData: {
        data: GeocodeResponse;
        warning: string | undefined;
      } = await this.geoCodeByAddress(
        sourcingData.locationAddressInput,
        sourcingData.locationCountryInput,
      );
      const geoRegionId: Pick<GeoRegion, 'id'> =
        await this.geoRegionService.saveGeoRegionAsPoint({
          name: sourcingData.locationCountryInput,
          coordinates: {
            lat: geoCodeResponseData.data.results[0].geometry.location.lat,
            lng: geoCodeResponseData.data.results[0].geometry.location.lng,
          },
        });
      let adminRegionId: string;
      try {
        adminRegionId =
          await this.adminRegionService.getClosestAdminRegionByCoordinates(
            {
              lng: geoCodeResponseData?.data?.results[0]?.geometry.location.lng,
              lat: geoCodeResponseData?.data?.results[0]?.geometry.location.lat,
            },
            sourcingData as SourcingLocation,
          );
      } catch (e) {
        await this.geoRegionService.remove(geoRegionId as unknown as string);
        throw e;
      }
      return {
        ...sourcingData,
        adminRegionId,
        geoRegionId,
        locationWarning: geoCodeResponseData.warning,
      };
    }
  }
}
