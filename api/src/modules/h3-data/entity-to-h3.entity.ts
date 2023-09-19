import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { Material } from 'modules/materials/material.entity';
import { Indicator } from 'modules/indicators/indicator.entity';

export enum MATERIAL_TYPE {
  PRODUCER = 'producer',
  HARVEST = 'harvest',
}

@Entity({ name: 'entity_to_h3' })
export class EntityToH3 extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Material, (material: Material) => material.entityH3s, {
    nullable: true,
  })
  @JoinColumn({ name: 'materialId' })
  material!: Material;
  @Column()
  materialId!: string;

  @ManyToOne(() => Indicator, (indicator: Indicator) => indicator.entityH3s, {
    nullable: true,
  })
  @JoinColumn({ name: 'indicatorId' })
  indicator!: Indicator;
  @Column()
  indicatorId!: string;

  @ManyToOne(() => H3Data, (h3data: H3Data) => h3data.entityToH3s)
  @JoinColumn({ name: 'h3DataId' })
  h3Data!: H3Data;
  @Column()
  h3DataId!: string;

  @Column({
    type: 'enum',
    enum: MATERIAL_TYPE,
  })
  materialType!: MATERIAL_TYPE;
}
