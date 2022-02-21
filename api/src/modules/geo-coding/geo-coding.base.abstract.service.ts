import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { GeocodeRequest } from '@googlemaps/google-maps-services-js';
import { GeocodeResponseData } from '@googlemaps/google-maps-services-js/dist/geocode/geocode';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';

export abstract class GeoCodingBaseAbstractService {
  protected constructor(
    protected adminRegionService: AdminRegionsService,
    protected geoRegionService: GeoRegionsService,
    protected sourcingLocationService: SourcingLocationsService,
  ) {}

  abstract geocode(
    geocodeRequest: GeocodeRequest,
  ): Promise<GeocodeResponseData>;

  abstract reverseGeocode(coordinates: {
    lat: number;
    lng: number;
  }): Promise<GeocodeResponseData>;

  abstract geoCodeByCountry(country: string): Promise<GeocodeResponseData>;

  abstract geoCodeByAddress(
    locationAddress: string,
  ): Promise<GeocodeResponseData>;

  abstract isAddressACountry(locationTypes: string[]): boolean;

  abstract isAddressAdminLevel1(locationTypes: string[]): boolean;

  abstract isAddressAdminLevel2(locationTypes: string[]): boolean;

  abstract getIsoA2Code(geoCodedResponse: GeocodeResponseData): string;

  abstract hasBothAddressAndCoordinates(sourcingData: SourcingData): boolean;
}
