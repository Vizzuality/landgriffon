import { DataSource, Repository } from 'typeorm';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IndicatorRepository extends Repository<Indicator> {
  constructor(private dataSource: DataSource) {
    super(Indicator, dataSource.createEntityManager());
  }
}
