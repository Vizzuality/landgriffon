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

export enum INDICATOR_NAME_CODES {
  LF = 'LF',
  DF_SLUC = 'DF_SLUC',
  GHG_DEF_SLUC = 'GHG_DEF_SLUC',
  WU = 'WU',
  UWU = 'UWU',
  NL = 'NL',
  GHG_FARM = 'GHG_FARM',
  ENL = 'ENL',
  NCE = 'NCE',
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
  nameCode: INDICATOR_NAME_CODES;

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

  /**
   * Defines the calculation dependencies for each indicator. These will be static, and very unlikely to change
   * includeItself is a convenience parameter, that makes the passed indicatorType as part of the dependency list; it's
   * included for readability improvements in other parts of the code.
   * @param indicatorType
   * @param includeItself
   */
  // static getIndicatorCalculationDependencies(
  //   indicatorType: INDICATOR_TYPES,
  //   includeItself?: boolean,
  // ): INDICATOR_TYPES[] {
  //   let result: INDICATOR_TYPES[] = [];
  //   switch (indicatorType) {
  //     case INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE:
  //       result = [];
  //       break;
  //     case INDICATOR_TYPES.DEFORESTATION:
  //       result = [];
  //       break;
  //     case INDICATOR_TYPES.BIODIVERSITY_LOSS:
  //       result = [INDICATOR_TYPES.DEFORESTATION];
  //       break;
  //     case INDICATOR_TYPES.CARBON_EMISSIONS:
  //       result = [INDICATOR_TYPES.DEFORESTATION];
  //       break;
  //     default:
  //       result = [];
  //       break;
  //   }
  //
  //   if (includeItself) {
  //     result = [indicatorType, ...result];
  //   }
  //
  //   return result;
  // }
}
