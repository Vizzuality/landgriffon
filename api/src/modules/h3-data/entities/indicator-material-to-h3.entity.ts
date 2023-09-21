import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { H3Data } from 'modules/h3-data/entities/h3-data.entity';

@Entity({ name: 'indicators_materials_h3' })
// TODOL come up with a better name
export class IndicatorMaterialToH3 extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(
    () => Material,
    (material: Material) => material.indicatorToMaterialToH3,
  )
  @JoinColumn({ name: 'materialId' })
  material!: Material;
  @Column()
  materialId!: string;

  @ManyToOne(
    () => Indicator,
    (indicator: Indicator) => indicator.indicatorToMaterialToH3,
  )
  @JoinColumn({ name: 'indicatorId' })
  indicator!: Indicator;
  @Column()
  indicatorId!: string;

  @ManyToOne(() => H3Data, (h3data: H3Data) => h3data.materialToH3s)
  @JoinColumn({ name: 'h3DataId' })
  h3Data!: H3Data;
  @Column()
  h3DataId!: string;
}
