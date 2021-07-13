import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseServiceResource } from 'types/resource.interface';

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

  @Column({ type: 'text', nullable: false, unique: true })
  @ApiProperty()
  name!: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional()
  description?: string;

  /**
   * @debt: Reference: add relation to Unit
   */
  @Column({ nullable: true })
  @ApiPropertyOptional()
  unitId?: string;

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
}
