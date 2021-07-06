import { EntityRepository, Repository } from 'typeorm';
import { IndicatorSource } from 'modules/indicator-sources/indicator-source.entity';

@EntityRepository(IndicatorSource)
export class IndicatorSourceRepository extends Repository<IndicatorSource> {}
