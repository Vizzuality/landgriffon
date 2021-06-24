import { EntityRepository, Repository } from 'typeorm';
import { Supplier } from 'modules/suppliers/supplier.entity';

@EntityRepository(Supplier)
export class SuppliersRepository extends Repository<Supplier> {}
