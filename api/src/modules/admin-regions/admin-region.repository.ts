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
  async getAdminRegionAndGeoRegionIdByCoordinates(coordinates: {
    lng: number;
    lat: number;
  }): Promise<{ adminRegionId: string; geoRegionId: string }> {
    const res: any = await this.query(`
    SELECT a.id  AS "adminRegionId", g.id AS "geoRegionId"
    FROM admin_region a RIGHT JOIN geo_region g on a."geoRegionId" = g.id
    WHERE ST_Intersects(
        st_setsrid('POINT(${coordinates.lng} ${coordinates.lat})'::geometry, 4326),
        st_setsrid(g."theGeom"::geometry, 4326)
    )
    AND a."isoA2" IS NOT NULL;
    `);

    if (res.length === 0) {
      throw new NotFoundException(
        `No Admin Region where coordinates ${coordinates.lat}, ${coordinates.lng} are could been found`,
      );
    }
    return res[0];
  }
}
