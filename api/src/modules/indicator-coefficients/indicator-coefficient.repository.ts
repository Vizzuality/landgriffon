import { DataSource, Repository } from 'typeorm';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IndicatorCoefficientRepository extends Repository<IndicatorCoefficient> {
  constructor(private dataSource: DataSource) {
    super(IndicatorCoefficient, dataSource.createEntityManager());
  }
}
