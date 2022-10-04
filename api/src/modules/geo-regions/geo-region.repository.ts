import {
  EntityRepository,
  getManager,
  InsertResult,
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
   *
   * TODO: Refactor the queries so that they follow same approach / pattern to improve readability
   *
   */
  async saveGeoRegionAsRadius(
    newGeoRegionValues: LocationGeoRegionDto,
  ): Promise<string> {
    const selectQuery: SelectQueryBuilder<any> = getManager()
      .createQueryBuilder()
      .select(`hashtext(concat($3::text, points.radius))`)
      .addSelect(`points.radius`)
      .addSelect(`array(SELECT h3_polyfill(points.radius,6))`)
      .addSelect(`cardinality(array(SELECT h3_polyfill(points.radius,6)))`)
      .addSelect(
        `array(
        SELECT h3_compact(array(SELECT h3_polyfill(points.radius,6)))
      )`,
      )
      .from('points', 'points');

    const res: any = await this.query(
      `WITH
        points AS (SELECT ST_BUFFER(ST_SetSRID(ST_POINT($1,$2),4326)::geometry, 0.5) as radius)
      INSERT INTO geo_region (name, "theGeom", "h3Flat", "h3FlatLength", "h3Compact")
      ${selectQuery.getSql()}
      ON CONFLICT (name) DO UPDATE
          SET "theGeom" = excluded."theGeom", "h3Compact" = excluded."h3Compact"
        RETURNING id`,
      [
        newGeoRegionValues.coordinates.lng,
        newGeoRegionValues.coordinates.lat,
        `${newGeoRegionValues.coordinates.lng}-${newGeoRegionValues.coordinates.lat}, radius - `,
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
  ): Promise<string> {
    const res: InsertResult = await this.createQueryBuilder()
      .insert()
      .values({
        name: () => `hashtext(:arg1)`,
        theGeom: () => `ST_GeomFromText(:arg2, 4326)`,
        h3Flat: () => `array(SELECT h3_geo_to_h3(ST_GeomFromText(:arg2), 6))`,
        h3FlatLength: () =>
          `cardinality(array(SELECT h3_geo_to_h3(ST_GeomFromText(:arg2), 6)))`,
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

  /**
   * @description: Find an existing GeoRegion by its hashed name using coordinates. The name is a unique field
   *               so we avoid having multiple same GeoRegions. Searching by the hashed name is more performant
   *               that using geospatial computations to determine an existing geometry (theGeom)
   * @param coordinates
   */

  async getGeomPointByHashedName(coordinates: {
    lat: number;
    lng: number;
  }): Promise<GeoRegion[]> {
    return this.query(
      `SELECT * FROM geo_region where name = hashtext($1)::varchar `,
      [`Point of Production - ${coordinates.lng}-${coordinates.lat}`],
    );
  }

  async getGeomRadiusByHashedName(coordinates: {
    lat: number;
    lng: number;
  }): Promise<GeoRegion[]> {
    return this.query(
      `SELECT * FROM geo_region where name = hashtext(concat($1::text, (SELECT ST_BUFFER(ST_SetSRID(ST_POINT($2,$3),4326)::geometry, 0.5))))::varchar `,
      [
        `${coordinates.lng}-${coordinates.lat}, radius - `,
        coordinates.lng,
        coordinates.lat,
      ],
    );
  }
}
