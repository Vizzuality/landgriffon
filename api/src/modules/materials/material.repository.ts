import { EntityRepository, SelectQueryBuilder } from 'typeorm';
import { Material } from 'modules/materials/material.entity';
import { ExtendedTreeRepository } from 'utils/tree.repository';
import { CreateMaterialDto } from 'modules/materials/dto/create.material.dto';

@EntityRepository(Material)
export class MaterialRepository extends ExtendedTreeRepository<
  Material,
  CreateMaterialDto
> {
  async getMaterialsImportedByUserQuery(): Promise<
    SelectQueryBuilder<Material>
  > {
    const materialsQuery: SelectQueryBuilder<Material> =
      this.createQueryBuilder('mat')
        .select('mat.name', 'name')
        .addSelect('mat.id', 'id')
        .addSelect('bu.name', 'businessUnit')
        .addSelect('prod.name', 'producer')
        .addSelect('sup.name', 'supplier')
        .addSelect('sl.locationType', 'locationType')
        .addSelect('sl.locationCountryInput', 'country')
        .innerJoin('sourcing_location', 'sl', 'mat.id=sl.materialId')
        .leftJoin('business_unit', 'bu', 'bu.id=sl.businessUnitId')
        .leftJoin('supplier', 'sup', 'sup.id=sl.t1SupplierId')
        .leftJoin('supplier', 'prod', 'prod.id=sl.producerId')
        .orderBy('mat.name', 'ASC')
        .addOrderBy('sl.id', 'ASC');

    return materialsQuery;
  }
}
