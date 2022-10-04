import { EntityRepository, Repository } from 'typeorm';
import { Target } from 'modules/targets/target.entity';

@EntityRepository(Target)
export class TargetsRepository extends Repository<Target> {}
