import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { H3IndexValueData } from 'modules/h3-data/h3-data.entity';

/**
 * @debt: Check if we actually need extending nestjs-base-service over this module.
 * We should not need performing CRUD operations. Even if we want filtering capabilities
 * by abstraction (via nestjs-base-service), check if we can apply to the actual target tables since are not related to this entity

 */
@Injectable()
export class H3DataService {
  constructor(
    @InjectRepository(H3DataRepository)
    protected readonly h3DataRepository: H3DataRepository,
  ) {}

  /**
   * Find one H3 full data by its name
   */
  async findH3ByName(
    h3TableName: string,
    h3ColumnName: string,
  ): Promise<H3IndexValueData> {
    return await this.h3DataRepository.findH3ByName(h3TableName, h3ColumnName);
  }
}
