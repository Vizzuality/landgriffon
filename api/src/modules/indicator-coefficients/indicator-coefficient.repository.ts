import { EntityRepository, Repository } from 'typeorm';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';

@EntityRepository(IndicatorCoefficient)
export class IndicatorCoefficientRepository extends Repository<IndicatorCoefficient> {}
