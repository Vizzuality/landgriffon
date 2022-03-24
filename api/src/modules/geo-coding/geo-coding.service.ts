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
  ): Promise<SourcingLocation[]> {
    this.logger.log(
      `Geocoding locations for ${sourcingData.length} sourcing record elements`,
    );
    const geoCodedSourcingData: SourcingLocation[] = [];
    await Promise.all(
      sourcingData.map(async (sourcingData: SourcingData) => {
        if (sourcingData.locationType === LOCATION_TYPES.UNKNOWN) {
          geoCodedSourcingData.push(
            await this.geoCodeUnknownLocationType(sourcingData),
          );
        }
        if (
          sourcingData.locationType === LOCATION_TYPES.COUNTRY_OF_PRODUCTION
        ) {
          geoCodedSourcingData.push(
            await this.geoCodeCountryOfProduction(sourcingData),
          );
        }

        if (sourcingData.locationType === LOCATION_TYPES.AGGREGATION_POINT) {
          geoCodedSourcingData.push(
            await this.geoCodeAggregationPoint(sourcingData),
          );
        }
        if (sourcingData.locationType === LOCATION_TYPES.POINT_OF_PRODUCTION) {
          geoCodedSourcingData.push(
            await this.geoCodePointOfProduction(sourcingData),
          );
        }
      }),
    );
    return geoCodedSourcingData;
  }

  async geoCodeAggregationPoint(
    sourcingData: SourcingData,
  ): Promise<SourcingLocation> {
    return this.aggregationPointGeocodingService.geoCodeAggregationPoint(
      sourcingData,
    );
  }

  async geoCodePointOfProduction(
    sourcingData: SourcingData,
  ): Promise<SourcingLocation> {
    return this.pointOfProductionGeocodingService.geoCodePointOfProduction(
      sourcingData,
    );
  }

  async geoCodeCountryOfProduction(
    sourcingData: SourcingData,
  ): Promise<SourcingLocation> {
    return this.countryOfProductionService.geoCodeCountryOfProduction(
      sourcingData,
    );
  }

  async geoCodeUnknownLocationType(
    sourcingData: SourcingData,
  ): Promise<SourcingLocation> {
    return this.unknownLocationService.geoCodeUnknownLocationType(sourcingData);
  }
}
