import { Injectable, Logger } from '@nestjs/common';
import { AggregationPointGeocodingStrategy } from 'modules/geo-coding/strategies/aggregation-point.geocoding.service';
import { PointOfProductionGeocodingStrategy } from 'modules/geo-coding/strategies/point-of-production.geocoding.service';
import { CountryOfProductionGeoCodingStrategy } from 'modules/geo-coding/strategies/country-of-production.geocoding.service';
import { UnknownLocationGeoCodingStrategy } from 'modules/geo-coding/strategies/unknown-location.geocoding.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoCodingAbstractClass } from 'modules/geo-coding/geo-coding-abstract-class';

@Injectable()
export class GeoCodingService extends GeoCodingAbstractClass {
  protected readonly logger: Logger = new Logger(GeoCodingService.name);

  constructor(
    protected readonly aggregationPointGeocodingService: AggregationPointGeocodingStrategy,
    protected readonly pointOfProductionGeocodingService: PointOfProductionGeocodingStrategy,
    protected readonly countryOfProductionService: CountryOfProductionGeoCodingStrategy,
    protected readonly unknownLocationService: UnknownLocationGeoCodingStrategy,
  ) {
    super();
  }

  async geoCodeLocations(
    sourcingData: SourcingData[],
  ): Promise<SourcingData[]> {
    this.logger.log(
      `Geocoding locations for ${sourcingData.length} sourcing record elements`,
    );
    const geoCodedSourcingData: SourcingData[] = [];
    for await (const location of sourcingData) {
      if (location.locationType === LOCATION_TYPES.UNKNOWN) {
        geoCodedSourcingData.push(
          await this.geoCodeUnknownLocationType(location),
        );
      }
      if (location.locationType === LOCATION_TYPES.COUNTRY_OF_PRODUCTION) {
        geoCodedSourcingData.push(
          await this.geoCodeCountryOfProduction(location),
        );
      }

      if (location.locationType === LOCATION_TYPES.AGGREGATION_POINT) {
        geoCodedSourcingData.push(await this.geoCodeAggregationPoint(location));
      }
      if (location.locationType === LOCATION_TYPES.POINT_OF_PRODUCTION) {
        geoCodedSourcingData.push(
          await this.geoCodePointOfProduction(location),
        );
      }
    }

    return geoCodedSourcingData;
  }

  async geoCodeSourcingLocation(locationInfo: {
    locationAddressInput?: string;
    locationLatitude?: number;
    locationLongitude?: number;
    locationCountryInput: string;
    locationType: LOCATION_TYPES;
  }): Promise<SourcingLocation> {
    let geoCodedSourcingLocation: Partial<SourcingData> = {};
    if (locationInfo.locationType === LOCATION_TYPES.UNKNOWN) {
      geoCodedSourcingLocation = await this.geoCodeUnknownLocationType(
        locationInfo as SourcingData,
      );
    }
    if (locationInfo.locationType === LOCATION_TYPES.COUNTRY_OF_PRODUCTION) {
      geoCodedSourcingLocation = (await this.geoCodeCountryOfProduction(
        locationInfo as SourcingData,
      )) as SourcingData;
    }

    if (locationInfo.locationType === LOCATION_TYPES.AGGREGATION_POINT) {
      geoCodedSourcingLocation = (await this.geoCodeAggregationPoint(
        locationInfo as SourcingData,
      )) as SourcingData;
    }
    if (locationInfo.locationType === LOCATION_TYPES.POINT_OF_PRODUCTION) {
      geoCodedSourcingLocation = await this.geoCodePointOfProduction(
        locationInfo as SourcingData,
      );
    }
    return geoCodedSourcingLocation as SourcingLocation;
  }

  async geoCodeAggregationPoint(
    sourcingData: SourcingData,
  ): Promise<SourcingData> {
    return this.aggregationPointGeocodingService.geoCodeAggregationPoint(
      sourcingData,
    );
  }

  async geoCodePointOfProduction(
    sourcingData: SourcingData,
  ): Promise<SourcingData> {
    return this.pointOfProductionGeocodingService.geoCodePointOfProduction(
      sourcingData,
    );
  }

  async geoCodeCountryOfProduction(
    sourcingData: SourcingData,
  ): Promise<SourcingData> {
    return this.countryOfProductionService.geoCodeCountryOfProduction(
      sourcingData,
    );
  }

  async geoCodeUnknownLocationType(
    sourcingData: SourcingData,
  ): Promise<SourcingData> {
    return this.unknownLocationService.geoCodeUnknownLocationType(sourcingData);
  }
}
