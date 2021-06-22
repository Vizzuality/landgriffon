import { EntityRepository, Repository } from 'typeorm';
import { Materials } from './materials.entity';

@EntityRepository(Materials)
export class MaterialsRepository extends Repository<Materials> {}
