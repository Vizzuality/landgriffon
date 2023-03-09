import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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

// TODO: Enum for new updated LG methodology
export enum INDICATOR_TYPES {
  LAND_USE = 'LI',
  DEFORESTATION_RISK = 'DF_LUC_T',
  CLIMATE_RISK = 'GHG_LUC_T',
  WATER_USE = 'UWU_T',
  UNSUSTAINABLE_WATER_USE = 'UWUSR_T',
  SATELLIGENCE_DEFORESTATION = 'SAT_DF',
  SATELLIGENCE_DEFORESTATION_RISK = 'SAT_DF_R',
}

export const indicatorResource: BaseServiceResource = {
  className: 'Indicator',
  name: {
    singular: 'indicator',
    plural: 'indicators',
  },
  entitiesAllowedAsIncludes: ['unit'],
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

  @Column({ type: 'text', nullable: false, unique: true })
  nameCode: string;

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
    default: INDICATOR_STATUS.ACTIVE,
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

  @OneToMany(() => H3Data, (h3grid: H3Data) => h3grid.indicators, {
    nullable: true,
  })
  @JoinColumn()
  h3Grid: H3Data;
}
