import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { FeatureCollection, Feature } from 'geojson';
import {
  GetEUDRFeaturesGeoJSONDto,
  GetFeaturesGeoJsonDto,
} from 'modules/geo-regions/dto/get-features-geojson.dto';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { BaseQueryBuilder } from 'utils/base.query-builder';

@Injectable()
export class GeoFeaturesService extends Repository<GeoRegion> {
  logger: Logger = new Logger(GeoFeaturesService.name);

  constructor(private dataSource: DataSource) {
    super(GeoRegion, dataSource.createEntityManager());
  }

  async getGeoFeatures(
    dto: GetFeaturesGeoJsonDto | GetEUDRFeaturesGeoJSONDto,
  ): Promise<Feature[] | FeatureCollection> {
    const queryBuilder: SelectQueryBuilder<GeoRegion> =
      this.createQueryBuilder('gr');
    queryBuilder.innerJoin(SourcingLocation, 'sl', 'sl.geoRegionId = gr.id');

    const filteredQueryBuilder: SelectQueryBuilder<GeoRegion> =
      BaseQueryBuilder.addFilters(queryBuilder, dto);

    if (dto?.collection) {
      return this.selectAsFeatureCollection(filteredQueryBuilder);
    }
    return this.selectAsFeatures(filteredQueryBuilder);
  }

  private async selectAsFeatures(
    queryBuilder: SelectQueryBuilder<GeoRegion>,
  ): Promise<Feature[]> {
    queryBuilder.select(
      `
        json_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(gr.theGeom)::json,
          'properties', json_build_object('id', gr.id)
        )`,
      'geojson',
    );
    const result: Feature[] | undefined = await queryBuilder.getRawMany();
    if (!result.length) {
      throw new NotFoundException(`Could not retrieve geo features`);
    }
    return result;
  }

  private async selectAsFeatureCollection(
    queryBuilder: SelectQueryBuilder<GeoRegion>,
  ): Promise<FeatureCollection> {
    queryBuilder.select(
      `
        json_build_object(
          'type', 'FeatureCollection',
          'features', json_agg(
            json_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(gr.theGeom)::json,
              'properties', json_build_object('id', gr.id)
            )
          )
        )`,
      'geojson',
    );
    const result: FeatureCollection | undefined =
      await queryBuilder.getRawOne<FeatureCollection>();
    if (!result) {
      throw new NotFoundException(`Could not retrieve geo features`);
    }
    return result;
  }
}
