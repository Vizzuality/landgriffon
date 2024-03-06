import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { FeatureCollection, Feature } from 'geojson';
import {
  GetEUDRFeaturesGeoJSONDto,
  GetFeaturesGeoJsonDto,
} from 'modules/geo-regions/dto/get-features-geojson.dto';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';

@Injectable()
export class GeoFeaturesService extends Repository<GeoRegion> {
  constructor(private dataSource: DataSource) {
    super(GeoRegion, dataSource.createEntityManager());
  }

  async getGeoFeatures(): Promise<Feature[] | FeatureCollection> {
    return null as any;
  }

  async getGeoJson(
    dto?: GetEUDRFeaturesGeoJSONDto | GetFeaturesGeoJsonDto,
  ): Promise<any> {
    const queryBuilder: SelectQueryBuilder<GeoRegion> =
      this.createQueryBuilder('gr');
    queryBuilder
      .select(
        'json_build_object(type, FeatureCollection, features, json_agg(ST_AsGeoJSON(gr.theGeom)::json))',
        'geojson',
      )
      .innerJoin(SourcingLocation, 'sl', 'sl.geoRegionId = gr.id');
    if (dto?.geoRegionIds) {
      queryBuilder.where('gr.id IN (:...ids)', { ids: dto.geoRegionIds });
    }

    if (dto?.isEUDRRequested()) {
      queryBuilder.andWhere('sl.locationType = :type', {
        type: LOCATION_TYPES.EUDR,
      });
    }
    const [qury, params] = queryBuilder.getQueryAndParameters();
    return queryBuilder.getRawMany();
  }
}
