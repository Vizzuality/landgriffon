import { DataSource, Repository } from 'typeorm';
import { UnitConversion } from 'modules/unit-conversions/unit-conversion.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UnitConversionRepository extends Repository<UnitConversion> {
  constructor(private dataSource: DataSource) {
    super(UnitConversion, dataSource.createEntityManager());
  }
}
