import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm/repository/Repository';
import {
  MATERIAL_TO_H3_TYPE,
  MaterialToH3,
} from 'modules/materials/material-to-h3.entity';
import { EntityRepository, getManager, SelectQueryBuilder } from 'typeorm';
import { H3Data } from 'modules/h3-data/h3-data.entity';

@Injectable()
@EntityRepository(MaterialToH3)
export class MaterialsToH3sService extends Repository<MaterialToH3> {
  async findH3DataForMaterial(args: {
    materialId: string;
    year?: number;
    type: MATERIAL_TO_H3_TYPE;
  }): Promise<H3Data | undefined> {
    const queryBuilder: SelectQueryBuilder<H3Data> = getManager()
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
