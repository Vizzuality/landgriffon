import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty } from '@nestjs/swagger';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { Material } from 'modules/materials/material.entity';

export enum MATERIAL_TO_H3_TYPE {
  PRODUCER = 'producer',
  HARVEST = 'harvest',
}

export const materialResource: BaseServiceResource = {
  className: 'MaterialToH3',
  name: {
    singular: 'materialToH3',
    plural: 'materialToH3s',
  },
  entitiesAllowedAsIncludes: ['material', 'h3Data'],
  columnsAllowedAsFilter: ['type'],
};

@Entity()
export class MaterialToH3 extends TimestampedBaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Material, (material: Material) => material.materialToH3s)
  @JoinColumn({ name: 'materialId' })
  material!: Material;
  @Column()
  materialId!: string;

  @ManyToOne(() => H3Data, (h3data: H3Data) => h3data.materialToH3s)
  @JoinColumn({ name: 'h3DataId' })
  h3Data!: H3Data;
  @Column()
  h3DataId!: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: MATERIAL_TO_H3_TYPE,
  })
  type!: MATERIAL_TO_H3_TYPE;
}
