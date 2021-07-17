import { EntityRepository } from 'typeorm';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateBusinessUnitDto } from 'modules/business-units/dto/create.business-unit.dto';

@EntityRepository(BusinessUnit)
export class BusinessUnitRepository extends ExtendedTreeRepository<
  BusinessUnit,
  CreateBusinessUnitDto
> {}
