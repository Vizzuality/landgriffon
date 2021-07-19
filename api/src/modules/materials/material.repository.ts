import { EntityRepository } from 'typeorm';
import { Material } from 'modules/materials/material.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';

@EntityRepository(Material)
export class MaterialRepository extends ExtendedTreeRepository<
  Material,
  CreateMaterialDto
> {}
