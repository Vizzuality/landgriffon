import {
  Brackets,
  EntityRepository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateAdminRegionDto } from 'modules/admin-regions/dto/create.admin-region.dto';
import { Logger, NotFoundException } from '@nestjs/common';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GetAdminRegionTreeWithOptionsDto } from 'modules/admin-regions/dto/get-admin-region-tree-with-options.dto';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';

@EntityRepository(AdminRegion)
export class AdminRegionRepository extends ExtendedTreeRepository<
  AdminRegion,
  CreateAdminRegionDto
> {
  logger: Logger = new Logger(AdminRegionRepository.name);

  async getAdminRegionAndGeoRegionIdByCoordinatesAndLevel(
    searchParams: {
      lng: number;
      lat: number;
      level: number;
    },
    country?: string,
  ): Promise<{ adminRegionId: string; geoRegionId: string }> {
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
        `No Admin Region where Coordinates: LAT: ${searchParams.lat}, LONG: ${searchParams.lng} are could been found`,
      );
    }
    if (country) {
      await this.validateAdminRegion(
        res[0].adminRegionId,
        country,
        searchParams,
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

  async getClosestAdminRegionByCoordinates(
    coordinates: {
      lng: number;
      lat: number;
    },
    country?: string,
  ): Promise<any> {
    const res: any = await this.query(
      `SELECT a.id AS "adminRegionId" , a."name", a."level" , g."name" , g.id AS "geoRegionId"
        FROM admin_region a
               RIGHT JOIN geo_region g on a."geoRegionId" = g.id
        WHERE ST_Intersects(
          st_setsrid($1::geometry, 4326),
          st_setsrid(g."theGeom"::geometry, 4326)
          )
        AND a.id IS NOT NULL
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
    const result: any = res.reduce(function (previous: any, current: any) {
      return previous.level > current.level ? previous : current;
    });
    if (country) {
      await this.validateAdminRegion(
        result.adminRegionId,
        country,
        coordinates,
      );
    }

    return result;
  }

  /**
   ** @description Retrieves Admin Region and its ancestor and checks if it's inside provided country
   */
  async validateAdminRegion(
    adminRegionId: string,
    country: string,
    coordinates: {
      lng: number;
      lat: number;
    },
  ): Promise<void> {
    const intersectingCountries: AdminRegion[] = await this.query(
      `
     SELECT a.id AS "adminRegionId" , a."name", a."level" , g."name" , g.id AS "geoRegionId"
        FROM admin_region a
               RIGHT JOIN geo_region g on a."geoRegionId" = g.id
        WHERE ST_Intersects(
         ST_BUFFER(ST_SetSRID(ST_POINT($1 ,$2),4326)::geometry, 0.01),
          st_setsrid(g."theGeom"::geometry, 4326)
          )
        AND a.id IS NOT null
        and a."level" = 0
    `,
      [coordinates.lng, coordinates.lat],
    );
    if (
      !intersectingCountries.some(
        (intersectingCountry: AdminRegion) =>
          intersectingCountry.name === country,
      )
    )
      throw new GeoCodingError(
        `coordinates ${coordinates.lng}, ${coordinates.lat} are not inside ${country}`,
      );
  }

  /**
   ** @description Retrieves Admin Regions and their ancestors (in a plain format) when there are associated Sourcing Locations
   */

  async getSourcingDataAdminRegionsWithAncestry(
    adminRegionTreeOptions: GetAdminRegionTreeWithOptionsDto,
  ): Promise<AdminRegion[]> {
    // Join and filters over materials present in sourcing-locations. Resultant query returns IDs of elements meeting the filters
    const queryBuilder: SelectQueryBuilder<AdminRegion> =
      this.createQueryBuilder('ar')
        .select('ar.id')
        .innerJoin(SourcingLocation, 'sl', 'sl.adminRegionId = ar.id')
        .distinct(true);
    if (adminRegionTreeOptions.originIds) {
      queryBuilder.andWhere('ar.id IN (:...originIds)', {
        originIds: adminRegionTreeOptions.originIds,
      });
    }
    if (adminRegionTreeOptions.supplierIds) {
      queryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('sl."t1SupplierId" IN (:...suppliers)', {
            suppliers: adminRegionTreeOptions.supplierIds,
          }).orWhere('sl."producerId" IN (:...suppliers)', {
            suppliers: adminRegionTreeOptions.supplierIds,
          });
        }),
      );
    }
    if (adminRegionTreeOptions.materialIds) {
      queryBuilder.andWhere('sl.materialId IN (:...materialIds)', {
        materialIds: adminRegionTreeOptions.materialIds,
      });
    }
    if (adminRegionTreeOptions.businessUnitIds) {
      queryBuilder.andWhere('sl.businessUnitId IN (:...businessUnitIds)', {
        businessUnitIds: adminRegionTreeOptions.businessUnitIds,
      });
    }

    if (adminRegionTreeOptions.locationTypes) {
      queryBuilder.andWhere('sl.locationType IN (:...locationTypes)', {
        locationTypes: adminRegionTreeOptions.locationTypes,
      });
    }

    if (adminRegionTreeOptions.scenarioId) {
      queryBuilder
        .innerJoin(
          ScenarioIntervention,
          'scenarioIntervention',
          'sl.scenarioInterventionId = scenarioIntervention.id',
        )
        .innerJoin(
          Scenario,
          'scenario',
          'scenarioIntervention.scenarioId = scenario.id',
        )
        .andWhere('scenario.id = :scenarioId', {
          scenarioId: adminRegionTreeOptions.scenarioId,
        });
    } else {
      queryBuilder.andWhere('sl.scenarioInterventionId is null');
    }

    const [subQuery, subQueryParams]: [string, any[]] =
      queryBuilder.getQueryAndParameters();

    // Recursively find elements and their ancestry given Ids of the subquery above
    const result: AdminRegion[] = await this.query(
      `
        with recursive adminregion_tree as (
            select m.id, m."parentId", m."name"
            from admin_region m
            where id in
                        (${subQuery})
            union all
            select c.id, c."parentId", c."name"
            from admin_region c
            join adminregion_tree p on p."parentId" = c.id
        )
        select distinct *
        from adminregion_tree
        order by name`,

      subQueryParams,
    ).catch((err: Error) =>
      this.logger.error(
        `Query failed for retrieving Admin Regions with Sourcing Locations: `,
        err,
      ),
    );

    return result;
  }
}
