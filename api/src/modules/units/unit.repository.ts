import { DataSource, Repository } from 'typeorm';
import { Unit } from 'modules/units/unit.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UnitRepository extends Repository<Unit> {
  constructor(private dataSource: DataSource) {
    super(Unit, dataSource.createEntityManager());
  }
}
