import { Connection, getConnection, QueryRunner, Repository, SelectQueryBuilder } from "typeorm";
import { Logger } from '@nestjs/common';
import { SaveOptions } from 'typeorm/repository/SaveOptions';
import { MATERIAL_TO_H3_TYPE } from '../../materials/material-to-h3.entity';

export abstract class AppBaseRepository<Entity> extends Repository<Entity> {
  logger: Logger = new Logger(this.constructor.name);

  async calculateImpact<Entity>(
    georegionId: string,
    materialH3Id: string,
    materialType: MATERIAL_TO_H3_TYPE,

    options?: SaveOptions,
  ): Promise<Entity[]> {
    const connection: Connection = getConnection();
    const queryRunner: QueryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const result: Entity[][] = [];

    try {
      // MAIN LOGIC

      // STEPS
      /**
       * 1. Get material h3 data table and column name
       * 1.1 For each year, get the closest available material h3 data
       * 2. Get indicator h3 data table and column name
       * 2.1 For each year, get the closest available material h3 data
       ** Look at how interventions impact calculus implements this.
       *
       * 2.1 Get deforestation indicator h3 data and column name (because this indicator needs to be crossed with this data)
       *
       * CRAZY IDEAZ:
       * 1. We have 12 years to calculate impact: 2010-2022 (12 DB calls)
       * 2. We have 3 available years to calculate impact: 2010, 2014, 2020
       *
       * Before performing any call, can we determine that Sourcing Records from 2010 to 2012 will use data of 2010
       *                                                                    from 2013 to 2017  will use data of 2014
       *                                                                    from 2018 to 2022 will use data of 2022
       *
       * Knowing this, can we calculate impacts for those years simultaneosly (arent we doing that now anyway?) in 3 DB CALLS
       * instead of doing 12, each for one year?
       *
       * LONG STORY SHORT:
       *
       * Can we do as much calls as different h3 data tables we need to attack (in this case 3)
       * instead of doing as much calls as years we have to calculate impact for(in this case 12)
       *
       *

       *
       */
      let materialH3data: any;
      let indictorH3Data: any;

      const result: any = await this.createQueryBuilder().select([
        'sr.id as "sourcingRecordId",\n          sr.tonnage,\n          sr.year,\n          slwithmaterialh3data.id as "sourcingLocationId",\n          slwithmaterialh3data.production,\n          slwithmaterialh3data."harvestedArea",\n          slwithmaterialh3data."rawDeforestation",\n          slwithmaterialh3data."rawBiodiversity",\n          slwithmaterialh3data."rawCarbon",\n          slwithmaterialh3data."rawWater",\n          slwithmaterialh3data."materialH3DataId"',
      ]).from((subQuery:  SelectQueryBuilder<any> )=> subQuery.select(`sum()`)
        .from(`get_h3_uncompact_geo_region($1, $2)`, 'geoRegion')
        .innerJoin('$3', 'materialH3', `materialH3.h3index = geoRegion.h3index`)
        .innerJoin(
          '$4',
          'bioDiversityh3',
          'bioDiversityh3.h3index = geoRegion.h3index',
        )
        .innerJoin(
          '$5',
          'deforestationH3',
          'deforestation.h3index = geoRegion.h3index',
        );

      // This
      const data: any = await this.createQueryBuilder()
        .select(`sum()`)
        .from(`get_h3_uncompact_geo_region($1, $2)`, 'geoRegion')
        .innerJoin('$3', 'materialH3', `materialH3.h3index = geoRegion.h3index`)
        .innerJoin(
          '$4',
          'bioDiversityh3',
          'bioDiversityh3.h3index = geoRegion.h3index',
        )
        .innerJoin(
          '$5',
          'deforestationH3',
          'deforestation.h3index = geoRegion.h3index',
        );
      // commit transaction if every chunk was saved successfully
      await queryRunner.commitTransaction();
    } catch (err) {
      // rollback changes before throwing error
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // release query runner which is manually created
      await queryRunner.release();
    }
    return result.flat();
  }
}
