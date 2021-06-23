import { EntityRepository, Repository } from 'typeorm';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';

@EntityRepository(BusinessUnit)
export class BusinessUnitRepository extends Repository<BusinessUnit> {}
