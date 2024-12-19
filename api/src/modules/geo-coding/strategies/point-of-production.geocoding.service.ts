import { Injectable, Logger } from '@nestjs/common';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { BaseStrategy } from 'modules/geo-coding/strategies/base-strategy';
import { GeocodeResponse } from 'modules/geo-coding/geocoders/geocoder.interface';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoRegion } from '../../geo-regions/geo-region.entity';
import { AdminRegion } from '../../admin-regions/admin-region.entity';

@Injectable()
export class PointOfProductionGeocodingStrategy extends BaseStrategy {
  logger: Logger = new Logger(PointOfProductionGeocodingStrategy.name);

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
      const geoRegionId: string =
        await this.geoRegionService.saveGeoRegionAsPoint({
          name: sourcingData.locationCountryInput,
          coordinates: {
            lat: sourcingData.locationLatitude,
            lng: sourcingData.locationLongitude,
          },
        });
      let adminRegionId: string;
      let adminRegion: AdminRegion;
      let geoRegion: GeoRegion;

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
        geoRegion = await this.geoRegionService.getById(geoRegionId);
        adminRegion = await this.adminRegionService.getById(adminRegionId);
      } catch (e) {
        const existingSourcingLocation: SourcingLocation | null =
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
        adminRegion,
        geoRegion,
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
      const geoRegionId: string =
        await this.geoRegionService.saveGeoRegionAsPoint({
          name: sourcingData.locationCountryInput,
          coordinates: {
            lat: geoCodeResponseData.data.results[0].geometry.location.lat,
            lng: geoCodeResponseData.data.results[0].geometry.location.lng,
          },
        });
      let adminRegionId: string;
      let adminRegion: AdminRegion;
      let geoRegion: GeoRegion;
      // TODO: Why are we doing this? In case the admin region cannot be found, to then delete the created geoRegion?
      //       probably a better idea to do this in a single transacion, but we should check how it will affect the whole process if we
      //       we want to make the whole import transactional
      try {
        adminRegionId = (
          await this.adminRegionService.getClosestAdminRegionByCoordinates(
            {
              lng: geoCodeResponseData?.data?.results[0]?.geometry.location.lng,
              lat: geoCodeResponseData?.data?.results[0]?.geometry.location.lat,
            },
            sourcingData as SourcingLocation,
          )
        ).adminRegionId;
        geoRegion = await this.geoRegionService.getById(geoRegionId);
        adminRegion = await this.adminRegionService.getById(adminRegionId);
      } catch (e) {
        await this.geoRegionService.remove(geoRegionId as unknown as string);
        throw e;
      }
      return {
        ...sourcingData,
        adminRegionId,
        geoRegionId,
        locationWarning: geoCodeResponseData.warning,
        adminRegion,
        geoRegion,
      };
    }
  }
}
