import {
  EntityRepository,
  getManager,
  InsertResult,
  QueryResult,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { LocationGeoRegionDto } from 'modules/geo-regions/dto/location.geo-region.dto';

@EntityRepository(GeoRegion)
export class GeoRegionRepository extends Repository<GeoRegion> {
  /**
   * Saves a new geo-regions with theGeom as a 50KM radius around given coordinates
   * @param newGeoRegionValues
   * name, coordinates
   * @returns created geo-regions id
   */

  /**
   * TODO: QueryBuilder doesn't seem to work with WITH clauses, but we still need to escape the variables we're injecting into the query.
   *
   * NOTE: Against all documentation and whats happening in mars, the correct value to generate a 50KM radius around a given point is 0.5
   * instead of 50000 (which should be the correct value)
   */
  async saveGeoRegionAsRadius(
    newGeoRegionValues: LocationGeoRegionDto,
  ): Promise<GeoRegion> {
    const selectQuery: SelectQueryBuilder<any> = getManager()
      .createQueryBuilder()
      .select(`hashtext($3)`)
      .addSelect(`points.radius`)
      .addSelect(
        `array(
        SELECT h3_compact(array(SELECT h3_polyfill(points.radius,6)))
      )`,
      )
      .from('points', 'points');

    const res: any = await this.query(
      `WITH
        points AS (SELECT ST_BUFFER(ST_SetSRID(ST_POINT($1,$2),4326)::geometry, 0.5) as radius)
      INSERT INTO geo_region (name, "theGeom", "h3Compact")
      ${selectQuery.getSql()}
      ON CONFLICT (name) DO UPDATE
          SET "theGeom" = excluded."theGeom", "h3Compact" = excluded."h3Compact"
        RETURNING id`,
      [
        newGeoRegionValues.coordinates.lng,
        newGeoRegionValues.coordinates.lat,
        `${newGeoRegionValues.coordinates.lng}-${newGeoRegionValues.coordinates.lat}`,
      ],
    );

    return res[0].id;
  }

  /**
   * Saves a new geo-regions with theGeom as POINT (as it comes)
   * @param newGeoRegionValues name, coordinates
   * @returns created geo-regions id
   */
  async saveGeoRegionAsPoint(
    newGeoRegionValues: LocationGeoRegionDto,
  ): Promise<Pick<GeoRegion, 'id'>> {
    const res: InsertResult = await this.createQueryBuilder()
      .insert()
      .values({
        name: () => `hashtext(:arg1)`,
        theGeom: () => `ST_GeomFromText(:arg2, 4326)`,
        h3Compact: () =>
          `array( SELECT (h3_compact(array(SELECT h3_geo_to_h3(ST_GeomFromText(:arg2), 6)))))`,
      })
      .setParameter(
        'arg1',
        `Point of Production - ${newGeoRegionValues.coordinates.lng}-${newGeoRegionValues.coordinates.lat}`,
      )
      .setParameter(
        'arg2',
        `POINT(${newGeoRegionValues.coordinates.lng} ${newGeoRegionValues.coordinates.lat})`,
      )
      .orUpdate(['theGeom', 'h3Compact'], ['name'])
      .returning('id')
      .execute();

    return res.raw[0].id;
  }
}
