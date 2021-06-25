import { EntityRepository, Repository } from 'typeorm';
import { Material } from 'modules/materials/material.entity';

@EntityRepository(Material)
export class MaterialRepository extends Repository<Material> {}
