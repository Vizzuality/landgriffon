import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { User } from 'modules/users/user.entity';

@Entity('indicator_coefficients')
export class IndicatorCoefficient extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  value: number;

  @ManyToOne(() => Indicator, (indicator: Indicator) => indicator.id)
  @JoinColumn({ name: 'indicator_id' })
  indicatorId: string;

  @ManyToOne(() => Material, (mat: Material) => mat.id)
  @JoinColumn({ name: 'material_id' })
  materialId: string;

  @Column({ type: 'int' })
  year: number;

  @ManyToOne(() => AdminRegion, (ar: AdminRegion) => ar.id)
  @JoinColumn({ name: 'admin_region_id' })
  adminRegionId: string;

  /**
   * @debt: Reference only: add relation to indicator-source
   */

  @Column()
  indicatorSourceId: string;

  @Column({
    type: 'timestamp',
    name: 'last_edited',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastEdited: string;

  @ManyToOne(() => User, (user: User) => user.id)
  @JoinColumn({ name: 'last_edited_user_id' })
  lastEditedUserId: string;
}
