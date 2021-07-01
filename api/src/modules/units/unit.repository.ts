import { EntityRepository, Repository } from 'typeorm';
import { Unit } from 'modules/units/unit.entity';

@EntityRepository(Unit)
export class UnitRepository extends Repository<Unit> {}
