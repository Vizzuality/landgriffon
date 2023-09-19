import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm/repository/Repository';
import { MATERIAL_TYPE, EntityToH3 } from 'modules/h3-data/entity-to-h3.entity';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { H3Data } from 'modules/h3-data/h3-data.entity';

/**
 * @debt: This needs to be refactored to be entityToH3Service
 */
@Injectable()
export class MaterialsToH3sService extends Repository<EntityToH3> {
  constructor(private dataSource: DataSource) {
    super(EntityToH3, dataSource.createEntityManager());
  }

  async findH3DataForMaterial(args: {
    materialId: string;
    year?: number;
    type: MATERIAL_TYPE;
  }): Promise<H3Data | undefined> {
    const queryBuilder: SelectQueryBuilder<H3Data> = this.dataSource
      .createQueryBuilder()
      .select()
      .from(H3Data, 'h3data')
      .leftJoin(
        'material_to_h3',
        'materialsToH3s',
        'materialsToH3s.h3DataId = h3data.id',
      )
      .where('materialsToH3s.materialId = :materialId', {
        materialId: args.materialId,
      })
      .andWhere('materialsToH3s.type = :type', { type: args.type });

    if (args.year) {
      queryBuilder
        .andWhere('h3data.year = :year', { year: args.year })
        .orderBy('year', 'ASC');
    }
    return queryBuilder.getRawOne();
  }
}
