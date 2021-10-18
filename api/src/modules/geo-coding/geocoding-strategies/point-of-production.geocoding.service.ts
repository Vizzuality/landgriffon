import { Injectable } from '@nestjs/common';
import { GeoCodingBaseService } from 'modules/geo-coding/geo-coding.base.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';

@Injectable()
export class PointOfProductionGeocodingService extends GeoCodingBaseService {
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
      const geoCodeResponseData = await this.geoCodeByCountry(
        sourcingData.locationCountryInput,
      );
      const {
        id: adminRegionId,
      } = await this.adminRegionService.getAdminAndGeoRegionIdByCountryIsoAlpha2(
        this.getIsoA2Code(geoCodeResponseData),
      );
      const geoRegionId = await this.geoRegionService.saveGeoRegionAsPoint({
        name: sourcingData.locationCountryInput,
        coordinates: {
          lat: sourcingData.locationLatitude,
          lng: sourcingData.locationLongitude,
        },
      });
      return {
        ...sourcingData,
        adminRegionId,
        geoRegionId,
      };
    }
    if (sourcingData.locationAddressInput) {
      const geocodedResponseData = await this.geoCodeByAddress(
        sourcingData.locationAddressInput,
      );
      const {
        id: adminRegionId,
      } = await this.adminRegionService.getAdminAndGeoRegionIdByCountryIsoAlpha2(
        this.getIsoA2Code(geocodedResponseData),
      );
      const geoRegionId = await this.geoRegionService.saveGeoRegionAsPoint({
        name: sourcingData.locationCountryInput,
        coordinates: {
          lat: geocodedResponseData.results[0].geometry.location.lat,
          lng: geocodedResponseData.results[0].geometry.location.lng,
        },
      });
      return {
        ...sourcingData,
        adminRegionId,
        geoRegionId,
      };
    }
  }
}
