import { Injectable } from '@nestjs/common';
import { getManager } from 'typeorm';
import { H3Data } from 'modules/h3-data/h3-data.entity';

/**
 * @debt: Check if we actually need extending nestjs-base-service over this module.
 * We should not need performing CRUD operations. Even if we want filtering capabilities
 * by abstraction (via nestjs-base-service), check if we can apply to the actual target tables since are not related to this entity
 *
 * For performing h3 data retrieving, we can use built or raw sql queries via entity-manager
 * https://typeorm.io/#/entity-manager-api
 */
@Injectable()
export class H3DataService {
  /**
   * Get all H3 info
   */

  async findAll(): Promise<any> {
    return await getManager()
      .createQueryBuilder()
      .select('*')
      .from(H3Data, 'h3')
      .getRawMany();
  }

  /**
   * Find one H3 full data by its name
   */
  async findOne(h3tableName: string): Promise<unknown> {
    // TODO: Implement this as soons as magic table creation is merged
    return;
    //return await getManager()
    //  .createQueryBuilder()
    //  .select('*')
    //  .from(h3tableName as BaseEntity, h3tableName)
    //  .getMany();
  }
}
