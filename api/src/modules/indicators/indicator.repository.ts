import { EntityRepository, Repository } from 'typeorm';
import { Indicator } from 'modules/indicators/indicator.entity';

@EntityRepository(Indicator)
export class IndicatorRepository extends Repository<Indicator> {}
