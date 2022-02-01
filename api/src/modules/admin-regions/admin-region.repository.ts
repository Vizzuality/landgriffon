import { EntityRepository } from 'typeorm';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateAdminRegionDto } from 'modules/admin-regions/dto/create.admin-region.dto';
import { NotFoundException } from '@nestjs/common';

@EntityRepository(AdminRegion)
export class AdminRegionRepository extends ExtendedTreeRepository<
  AdminRegion,
  CreateAdminRegionDto
> {
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
      throw new NotFoundException(
        `No Admin Region where coordinates ${searchParams.lat}, ${searchParams.lng} are could been found`,
      );
    }
    return res[0];
  }

  /**
   * @description: Get the closest available geometry given some coordinates.
   * @note We don't know the adminRegion.level here so we use PostGIS ST_DWithin and ST_DistanceSphere
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
        AND ST_DWithin(g."theGeom" , st_setsrid($1::geometry, 4326), 1000)
        AND a.level IS NOT NULL
        ORDER BY a.level DESC
        LIMIT 1`,
      [`POINT(${coordinates.lng} ${coordinates.lat})`],
    );
    if (!res.length) {
      throw new NotFoundException(
        `No Admin Region where coordinates ${coordinates.lat}, ${coordinates.lng} are could been found`,
      );
    }
    return res[0];
  }
}
