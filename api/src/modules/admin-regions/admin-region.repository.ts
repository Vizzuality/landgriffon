import { EntityRepository } from 'typeorm';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateAdminRegionDto } from 'modules/admin-regions/dto/create.admin-region.dto';
import { Logger, NotFoundException } from '@nestjs/common';

@EntityRepository(AdminRegion)
export class AdminRegionRepository extends ExtendedTreeRepository<
  AdminRegion,
  CreateAdminRegionDto
> {
  logger: Logger = new Logger(AdminRegionRepository.name);

  async getAdminRegionAndGeoRegionIdByCoordinatesAndLevel(searchParams: {
    lng: number;
    lat: number;
    level: number;
  }): Promise<{ adminRegionId: string; geoRegionId: string }> {
    const res: any = await this.query(
      `
        SELECT a.id AS "adminRegionId", g.id AS "geoRegionId"
        FROM admin_region a
               RIGHT JOIN geo_region g on a."geoRegionId" = g.id
        WHERE ST_Intersects(
          st_setsrid($1::geometry, 4326),
          st_setsrid(g."theGeom"::geometry, 4326)
          )
          AND a."level" = ${searchParams.level};
        ;
      `,
      [`POINT(${searchParams.lng} ${searchParams.lat})`],
    );

    if (!res.length) {
      this.logger.error(
        `Could not retrieve a Admin Region with LEVEL ${searchParams.level} and Coordinates: LAT: ${searchParams.lat} LONG: ${searchParams.lng}`,
      );
      throw new NotFoundException(
        `No Admin Region where coordinates ${searchParams.lat}, ${searchParams.lng} are could been found`,
      );
    }
    return res[0];
  }

  /**
   * @description: Get the closest available geometry given some coordinates.
   * @note We don't know the adminRegion.level here so we just order the results by this field and get the most accurate one (with the higher level value)
   *       Limiting the result to 3 as we only have 3 levels of admin regions
   *       Then we take the most accurate geometry (the higher value of adminRegion.level)
   */

  //TODO: Couldn't figure out how to retrieve the most accurate value straight from the query. Ordering the values always retrieve
  //      level 1 or 2, and depending on coordinates, level 0.
  //      Check how to properly perform this

  async getClosestAdminRegionByCoordinates(coordinates: {
    lng: number;
    lat: number;
  }): Promise<any> {
    const res: any = await this.query(
      `SELECT a.id AS "adminRegionId" , a."name", a."level" , g."name" , g.id AS "geoRegionId"
        FROM admin_region a
               RIGHT JOIN geo_region g on a."geoRegionId" = g.id
        WHERE ST_Intersects(
          st_setsrid($1::geometry, 4326),
          st_setsrid(g."theGeom"::geometry, 4326)
          )
        ORDER BY a.level DESC
        LIMIT 3`,
      [`POINT(${coordinates.lng} ${coordinates.lat})`],
    );

    if (!res.length) {
      this.logger.error(
        `Could not find any Admin Region that intersects with Coordinates: LAT: ${coordinates.lat} LONG: ${coordinates.lng}`,
      );
      throw new NotFoundException(
        `No Admin Region where coordinates ${coordinates.lat}, ${coordinates.lng} are could been found`,
      );
    }

    /**
     * In this case we can get an Intersection with the radius created by this sourcing location so we get the highest level
     * as doing this is more performant that getting the geometry and intersecting with it
     */

    return res.reduce(function (previous: any, current: any) {
      return previous.level > current.level ? previous : current;
    });
  }
}
