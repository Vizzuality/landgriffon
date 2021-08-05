import { EntityRepository, Repository } from 'typeorm';
import { H3Data } from 'modules/h3-data/h3-data.entity';

/**
 * @note: This repository is created to make sure nestjs cretes H3Data table on the DB
 * instead of using a migration specifically for this table
 */
@EntityRepository(H3Data)
export class H3DataRepository extends Repository<H3Data> {}
