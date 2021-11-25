import { EntityRepository, Repository } from 'typeorm';
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
    const res: any = await this.query(
      `WITH
        points AS (SELECT ST_BUFFER(ST_SetSRID(ST_POINT(${newGeoRegionValues.coordinates.lng},${newGeoRegionValues.coordinates.lat}),4326)::geometry, 0.5) as radius)
      INSERT INTO geo_region (name, "theGeom", "h3Compact")
      SELECT
        hashtext('${newGeoRegionValues.coordinates.lng}-${newGeoRegionValues.coordinates.lng}') ,
        points.radius,
        array(
          SELECT h3_compact(array(SELECT h3_polyfill(points.radius,6)))
        )
      FROM points
        ON CONFLICT (name) DO UPDATE
          SET "theGeom" = excluded."theGeom", "h3Compact" = excluded."h3Compact"
        RETURNING id`,
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
    const res: any = await this.query(`
    INSERT INTO geo_region (name, "theGeom", "h3Compact")
            VALUES(
              hashtext('Point of Production - ${newGeoRegionValues.coordinates.lng}-${newGeoRegionValues.coordinates.lat}'),
              ST_GeomFromText('POINT(${newGeoRegionValues.coordinates.lng} ${newGeoRegionValues.coordinates.lat})', 4326),
              array( SELECT (h3_compact(array(SELECT h3_geo_to_h3(ST_GeomFromText('POINT(${newGeoRegionValues.coordinates.lng} ${newGeoRegionValues.coordinates.lat})'), 6)))))
            )
            ON CONFLICT (name) DO UPDATE
                SET "theGeom" = excluded."theGeom", "h3Compact" = excluded."h3Compact"
            RETURNING id`);

    return res[0].id;
  }
}
