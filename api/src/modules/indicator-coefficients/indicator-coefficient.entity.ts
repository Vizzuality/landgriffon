import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { User } from 'modules/users/user.entity';

@Entity()
export class IndicatorCoefficient extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  value?: number;

  @Column({ type: 'int' })
  year?: number;

  @ManyToOne(() => AdminRegion, (ar: AdminRegion) => ar.indicatorCoefficients)
  adminRegion: AdminRegion;

  /**
   * @debt: Reference only: add relation to indicator-source
   */

  @Column()
  indicatorSourceId: string;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastEdited: string;

  @ManyToOne(() => User, (user: User) => user.indicatorCoefficients)
  user: User;

  @ManyToOne(
    () => Indicator,
    (indicator: Indicator) => indicator.indicatorCoefficients,
  )
  indicator: Indicator;

  @ManyToOne(() => Material, (mat: Material) => mat.indicatorCoefficients)
  material: Material;
}
