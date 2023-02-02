import { DataSource, In, Repository } from 'typeorm';
import {
  Indicator,
  INDICATOR_STATUS,
} from 'modules/indicators/indicator.entity';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class IndicatorRepository extends Repository<Indicator> {
  constructor(private dataSource: DataSource) {
    super(Indicator, dataSource.createEntityManager());
  }
}
