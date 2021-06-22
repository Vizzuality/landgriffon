import { EntityRepository, Repository } from 'typeorm';
import { BusinessUnits } from './business-units.entity';

@EntityRepository(BusinessUnits)
export class BusinessUnitsRepository extends Repository<BusinessUnits> {}
