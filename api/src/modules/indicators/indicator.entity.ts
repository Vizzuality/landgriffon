import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseServiceResource } from 'types/resource.interface';
import { Unit } from 'modules/units/unit.entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';

export enum INDICATOR_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export const indicatorResource: BaseServiceResource = {
  className: 'Indicator',
  name: {
    singular: 'indicator',
    plural: 'indicators',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['name', 'description', 'status'],
};

@Entity()
export class Indicator extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id!: string;

  @Column({ type: 'text', nullable: true, unique: true })
  @ApiProperty()
  name!: string;

  @Column({ type: 'text', nullable: true, unique: true })
  shortName?: string;

  @Column({ type: 'text', nullable: true, unique: true })
  nameCode?: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional()
  description?: string;

  @ManyToOne(() => Unit, (unit: Unit) => unit.indicators, { eager: true })
  @JoinColumn()
  unit!: Unit;

  @Column({
    type: 'enum',
    enum: INDICATOR_STATUS,
    enumName: 'indicatorStatus',
    default: INDICATOR_STATUS.INACTIVE,
  })
  @ApiProperty()
  status!: INDICATOR_STATUS;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  metadata?: JSON;

  @OneToMany(
    () => IndicatorCoefficient,
    (ic: IndicatorCoefficient) => ic.indicator,
  )
  @ApiPropertyOptional()
  indicatorCoefficients: IndicatorCoefficient[];

  // TODO: Check with data if this relation can be stablished / make sense

  @OneToOne(() => H3Data, (h3grid: H3Data) => h3grid.id, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'h3GridId' })
  h3Grid: H3Data;

  @Column({ nullable: true })
  h3GridId!: string;
}
