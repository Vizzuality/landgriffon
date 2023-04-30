import { DataSource, Repository } from 'typeorm';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ScenarioRepository extends Repository<Scenario> {
  constructor(private dataSource: DataSource) {
    super(Scenario, dataSource.createEntityManager());
  }
}
