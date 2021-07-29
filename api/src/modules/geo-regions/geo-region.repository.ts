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
   *
   * TODO: Against all documentation and whats happening in mars, the correct value to generate a 50KM radius around a given point is 0.5
   * instead of 50000 (which should be the correct value)
   *
   * TODO: Check how to calculate H3Compact without having to re-calculate (twice) the radius around a given point
   */
  async saveGeoRegionAsRadius(
    newGeoRegionValues: LocationGeoRegionDto,
  ): Promise<GeoRegion> {
    const res = await this.query(
      `INSERT INTO geo_region (name, "theGeom", "h3Compact")
              VALUES (
                hashtext('${newGeoRegionValues.coordinates.lng}-${newGeoRegionValues.coordinates.lng}') ,
                (SELECT
                        ST_BUFFER(ST_SetSRID(ST_POINT(${newGeoRegionValues.coordinates.lng},${newGeoRegionValues.coordinates.lat}),4326)::geometry,0.5)),
                array(
                    SELECT h3_compact(array(
                    SELECT h3_polyfill(
                        (ST_BUFFER(ST_SetSRID(ST_POINT(${newGeoRegionValues.coordinates.lng},${newGeoRegionValues.coordinates.lat}),4326)::geometry,0.5)),6))))
            ) RETURNING id`,
    );

    return res[0].id;
  }

  /**
   * Saves a new geo-regions with theGeom as POINT (as it comes)
   * @param newGeoRegionValues
   * name, coordinates
   * @returns created geo-regions id
   */

  async saveGeoRegionAsPoint(
    newGeoRegionValues: LocationGeoRegionDto,
  ): Promise<Pick<GeoRegion, 'id'>> {
    const res = await this.query(`
    INSERT INTO geo_region (name, "theGeom", "h3Compact")
            VALUES(
            hashtext('Point of Production - ${newGeoRegionValues.coordinates.lng}-${newGeoRegionValues.coordinates.lat}'),
            ST_GeomFromText('POINT(${newGeoRegionValues.coordinates.lng} ${newGeoRegionValues.coordinates.lat})', 4326),
            array( SELECT (h3_compact(array(SELECT h3_geo_to_h3(ST_GeomFromText('POINT(${newGeoRegionValues.coordinates.lng} ${newGeoRegionValues.coordinates.lat})'), 6)))))
            ) RETURNING id`);

    return res[0].id;
  }
}
//array(
//  SELECT h3_compact(array(
//  SELECT h3_polyfill( (ST_Multi(ST_Buffer(
//  ST_GeomFromText('POINT(${newGeoRegionValues.coordinates.lng} ${newGeoRegionValues.coordinates.lat})'),
//  50) )), 6)
//))
//)
