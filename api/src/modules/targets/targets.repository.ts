import { DataSource, Repository } from 'typeorm';
import { Target } from 'modules/targets/target.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TargetsRepository extends Repository<Target> {
  constructor(private dataSource: DataSource) {
    super(Target, dataSource.createEntityManager());
  }
}
