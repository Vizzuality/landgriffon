import { EntityRepository, Repository } from 'typeorm';
import { UnitConversion } from 'modules/unit-conversions/unit-conversion.entity';

@EntityRepository(UnitConversion)
export class UnitConversionRepository extends Repository<UnitConversion> {}
