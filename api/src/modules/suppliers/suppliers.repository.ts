import { EntityRepository, Repository } from 'typeorm';
import { Suppliers } from 'modules/suppliers/suppliers.entity';

@EntityRepository(Suppliers)
export class SuppliersRepository extends Repository<Suppliers> {}
