import { EntityManager, InsertResult } from 'typeorm';
import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from '../geo-coding.service-v2';
import { GeoRegion } from '../../geo-regions/geo-region.entity';
import { AdminRegion } from '../../admin-regions/admin-region.entity';
import { GeoCodingError } from '../errors/geo-coding.error';
import { NotFoundException } from '@nestjs/common';

export class GeocodingRepository {
  constructor(public readonly manager: EntityManager) { }

  async saveGeoRegionAsPoint(
    locationInfo: SourcingLocationInfo,
  ): Promise<GeoRegion> {
    let result: InsertResult;
    try {
      result = await this.manager
        .createQueryBuilder()
        .insert()
        .into(GeoRegion)
        .values({
          name: () => `hashtext(:name)`,
          theGeom: () => `ST_GeomFromText(:geom, 4326)`,
          h3Flat: () => `array(SELECT h3_geo_to_h3(ST_GeomFromText(:geom), 6))`,
          h3FlatLength: () =>
            `cardinality(array(SELECT h3_geo_to_h3(ST_GeomFromText(:geom), 6)))`,
          h3Compact: () =>
            `array( SELECT (h3_compact(array(SELECT h3_geo_to_h3(ST_GeomFromText(:geom), 6)))))`,
        })
        .setParameter(
          'name',
          `Point of Production - ${locationInfo.locationLongitude}-${locationInfo.locationLatitude}`,
        )
        .setParameter(
          'geom',
          `POINT(${locationInfo.locationLongitude} ${locationInfo.locationLatitude})`,
        )
        .returning('*')
        .execute();
    } catch (e) {
      console.log(e);
      throw e;
    }

    return this.manager.findOneOrFail(GeoRegion, result.identifiers[0].id);
  }

  private async validateAdminRegion(locationInfo: SourcingLocationInfo): Promise<void> {
    const intersectingCountries = await this.manager.query(
      `
        SELECT a.id AS "adminRegionId", a."name", a."level", g.id AS "geoRegionId"
        FROM admin_region a
               RIGHT JOIN geo_region g ON a."geoRegionId" = g.id
        WHERE ST_Intersects(
          ST_Buffer(ST_SetSRID(ST_POINT($1, $2), 4326)::geometry, 0.01),
          st_setsrid(g."theGeom"::geometry, 4326)
              )
          AND a.id IS NOT NULL
          AND a."level" = 0
      `,
      [locationInfo.locationLongitude, locationInfo.locationLatitude],
    );

    if (
      !intersectingCountries.some(
        (intersectingCountry: AdminRegion) =>
          intersectingCountry.name === locationInfo.locationCountryInput,
      )
    ) {
      throw new GeoCodingError(
        locationInfo.locationAddressInput
          ? `Address ${locationInfo.locationAddressInput} is not inside ${locationInfo.locationCountryInput}`
          : `Coordinates ${locationInfo.locationLatitude}, ${locationInfo.locationLongitude} are not inside ${locationInfo.locationCountryInput}`,
      );
    }
  }

  public async getClosestAdminRegionByCoordinates(
    locationInfo: SourcingLocationInfo,
  ): Promise<AdminRegion> {
    const results = await this.manager.query(
      `
        SELECT a.id AS "adminRegionId", a."name", a."level", g."name" AS "geoRegionName", g.id AS "geoRegionId"
        FROM admin_region a
               RIGHT JOIN geo_region g ON a."geoRegionId" = g.id
        WHERE ST_Intersects(
          ST_SetSRID(ST_POINT($1, $2)::geometry, 4326),
          ST_SetSRID(g."theGeom"::geometry, 4326)
              )
          AND a.id IS NOT NULL
        ORDER BY a.level DESC LIMIT 3
      `,
      [locationInfo.locationLongitude, locationInfo.locationLatitude],
    );

    if (!results.length) {
      console.error(
        `Could not find any Admin Region that intersects with Coordinates: LAT: ${locationInfo.locationLatitude}, LNG: ${locationInfo.locationLongitude}`,
      );
      throw new GeoCodingError(
        `Coordinates ${locationInfo.locationLatitude}, ${locationInfo.locationLatitude} are not inside ${locationInfo.locationCountryInput}`,
      );
    }

    const highestLevelRegion = results.reduce(
      (prev: AdminRegion, curr: AdminRegion) =>
        prev.level > curr.level ? prev : curr,
    );

    await this.validateAdminRegion(locationInfo);

    return this.manager.getRepository(AdminRegion).findOneOrFail({
      where: { id: highestLevelRegion.adminRegionId },
    });
  }

  async saveGeoRegionAsRadius({ locationLatitude: lat, locationLongitude: lng }: {
    locationLatitude: number;
    locationLongitude: number;
  }): Promise<any> {
    const selectQuery = this.manager
      .createQueryBuilder()
      .select(`hashtext(concat($3::text, points.radius))`, 'name')
      .addSelect(`points.radius`, 'theGeom')
      .addSelect(`array(SELECT h3_polyfill(points.radius,6))`, 'h3Flat')
      .addSelect(
        `cardinality(array(SELECT h3_polyfill(points.radius,6)))`,
        'h3FlatLength',
      )
      .addSelect(
        `array(
        SELECT h3_compact(array(SELECT h3_polyfill(points.radius,6)))
      )`,
        'h3Compact',
      )
      .from('points', 'points');

    try {
      const result = await this.manager.query(
        `
          WITH points AS (SELECT ST_BUFFER(ST_SetSRID(ST_POINT($1, $2), 4326)::geometry, 0.5) as radius)
          INSERT
          INTO geo_region (name, "theGeom", "h3Flat", "h3FlatLength", "h3Compact")
          ${selectQuery.getSql()}
          RETURNING
          *;
        `,
        [
          lng, // $1
          lat, // $2
          `${lng}-${lat}, radius - `, // :hashText
        ],
      );

      const insertedGeoRegion = await this.manager.findOneOrFail(GeoRegion, {
        where: { id: result[0].id },
      });

      return insertedGeoRegion;

    } catch (error) {
      console.error(
        `Could not save GeoRegion as Radius with Coordinates: LAT: ${lat}, LNG: ${lng}`,
      );
    }
  }

  async getAdminRegionAndGeoRegionByCoordinatesAndLevel(
    locationInfo: SourcingLocationInfo,
    level: number,
  ): Promise<GeoCodedLocation> {
    let result: any;
    try {
      result = await this.manager.query(
        `
    SELECT a.id AS "adminRegionId", g.id AS "geoRegionId"
    FROM admin_region a
    RIGHT JOIN geo_region g ON a."geoRegionId" = g.id
    WHERE ST_Intersects(
      ST_SetSRID($1::geometry, 4326),
      st_setsrid(g."theGeom"::geometry, 4326)
    )
    AND a."level" = $2;
    `,
        [
          `POINT(${locationInfo.locationLongitude} ${locationInfo.locationLatitude})`,
          level,
        ],
      );
    } catch (error) {
      console.error(
        `Could not retrieve an Admin Region with LEVEL ${level} and Coordinates: LAT: ${locationInfo.locationLatitude} LONG: ${locationInfo.locationLongitude}`,
      );
      const a = 1;
    }

    if (!result.length) {
      console.error(
        `Could not retrieve an Admin Region with LEVEL ${level} and Coordinates: LAT: ${locationInfo.locationLatitude} LONG: ${locationInfo.locationLongitude}`,
      );
      throw new NotFoundException(
        `No Admin Region where Coordinates: LAT: ${locationInfo.locationLatitude}, LONG: ${locationInfo.locationLongitude} and LEVEL ${level} could be found`,
      );
    }

    const adminRegionId = result[0].adminRegionId;
    await this.validateAdminRegion(locationInfo);

    const adminRegion = await this.manager.getRepository(AdminRegion).findOne({
      where: { id: adminRegionId },
      relations: ['geoRegion'],
    });

    if (!adminRegion || !adminRegion.geoRegion) {
      throw new GeoCodingError(
        `Could not retrieve AdminRegion or its related GeoRegion with ID ${adminRegionId}`,
      );
    }

    return {
      adminRegion,
      geoRegion: adminRegion.geoRegion,
    };
  }

  async getCountryAdminRegionAndGeoRegionByCountryName(
    countryName: string,
  ): Promise<GeoCodedLocation> {
    const queryBuilder = this.manager
      .createQueryBuilder(AdminRegion, 'adminRegion')
      .innerJoinAndSelect('adminRegion.geoRegion', 'geoRegion')
      .where('adminRegion.name = :countryName', {
        countryName,
      })
      .andWhere('adminRegion.level = 0');

    const adminRegion: AdminRegion | null = await queryBuilder.getOne();

    if (!adminRegion || !adminRegion.geoRegion) {
      throw new GeoCodingError(
        `A Country level Admin Region with name ${countryName} could not be found`,
      );
    }

    return {
      adminRegion,
      geoRegion: adminRegion.geoRegion,
    };
  }
}
