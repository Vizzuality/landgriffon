import { Injectable, Logger } from '@nestjs/common';
import { AggregationPointGeocodingService } from 'modules/geo-coding/geocoding-strategies/aggregation-point.geocoding.service';
import { PointOfProductionGeocodingService } from 'modules/geo-coding/geocoding-strategies/point-of-production.geocoding.service';
import { CountryOfProductionService } from 'modules/geo-coding/geocoding-strategies/country-of-production.geocoding.service';
import { UnknownLocationService } from 'modules/geo-coding/geocoding-strategies/unknown-location.geocoding.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';

@Injectable()
export class GeoCodingService {
  protected readonly logger: Logger = new Logger(GeoCodingService.name);

  constructor(
    protected readonly aggregationPointGeocodingService: AggregationPointGeocodingService,
    protected readonly pointOfProductionGeocodingService: PointOfProductionGeocodingService,
    protected readonly countryOfProductionService: CountryOfProductionService,
    protected readonly unknownLocationService: UnknownLocationService,
  ) {}

  async geoCodeLocations(
    sourcingData: SourcingData[],
  ): Promise<SourcingData[]> {
    this.logger.log(
      `Geocoding locations for ${sourcingData.length} sourcing record elements`,
    );
    const geoCodedSourcingData: SourcingData[] = [];
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
