import { EntityRepository, Repository } from 'typeorm';
import { Scenario } from 'modules/scenarios/scenario.entity';

@EntityRepository(Scenario)
export class ScenarioRepository extends Repository<Scenario> {}
