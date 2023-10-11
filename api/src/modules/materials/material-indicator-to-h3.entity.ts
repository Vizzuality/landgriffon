import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Material } from 'modules/materials/material.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';

@Entity('material_indicator_to_h3')
export class MaterialIndicatorToH3 {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // TODO: double check how relations should be

  @ManyToOne(() => Material, (material: Material) => material.materialToH3s)
  @JoinColumn({ name: 'materialId' })
  material!: Material;
  @Column()
  materialId!: string;

  @ManyToOne(
    () => Indicator,
    (indicator: Indicator) => indicator.materialIndicatorToH3,
  )
  @JoinColumn({ name: 'indicatorId' })
  indicator!: Indicator;
  @Column()
  indicatorId!: string;

  @OneToOne(() => H3Data)
  @JoinColumn({ name: 'h3DataId' })
  h3Data!: H3Data;
  @Column()
  h3DataId!: string;
}
