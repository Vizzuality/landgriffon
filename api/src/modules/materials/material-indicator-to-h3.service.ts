import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm/repository/Repository';
import { DataSource } from 'typeorm';
import { MaterialIndicatorToH3 } from 'modules/materials/material-indicator-to-h3.entity';

@Injectable()
export class MaterialIndicatorToH3Service extends Repository<MaterialIndicatorToH3> {
  constructor(private dataSource: DataSource) {
    super(MaterialIndicatorToH3, dataSource.createEntityManager());
  }
}
