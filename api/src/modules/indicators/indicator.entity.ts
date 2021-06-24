import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';

export enum INDICATOR_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

@Entity('indicators')
export class Indicator extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @OneToMany(() => IndicatorCoefficient, (ic: IndicatorCoefficient) => ic.id)
  id: string;

  @Column({ type: 'text', nullable: false, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * @debt: Reference: add relation to Unit
   */
  @Column()
  unitId: string;

  @Column({
    type: 'enum',
    enum: INDICATOR_STATUS,
    enumName: 'indicator_status',
    default: INDICATOR_STATUS.INACTIVE,
  })
  status: INDICATOR_STATUS;

  @Column({ type: 'jsonb', nullable: true })
  metadata: JSON;
}
