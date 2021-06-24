import { EntityRepository, Repository } from 'typeorm';
import { Indicator } from './indicator.entity';

@EntityRepository(Indicator)
export class IndicatorRepository extends Repository<Indicator> {}
