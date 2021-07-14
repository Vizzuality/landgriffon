import { EntityRepository, Repository } from 'typeorm';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';

@EntityRepository(ScenarioIntervention)
export class ScenarioInterventionRepository extends Repository<ScenarioIntervention> {}
