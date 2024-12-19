import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BaseServiceResource } from 'types/resource.interface';

export const indicatorCoefficientResource: BaseServiceResource = {
  className: 'IndicatorCoefficient',
  name: {
    singular: 'indicatorCoefficient',
    plural: 'indicatorCoefficients',
  },
  entitiesAllowedAsIncludes: ['indicators'],
  columnsAllowedAsFilter: ['value', 'year', 'indicatorSourceId'],
};

@Entity()
export class IndicatorCoefficient extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'float', nullable: true })
  value?: number;

  @Column({ type: 'int' })
  year!: number;

  @Index()
  @ManyToOne(() => AdminRegion, (ar: AdminRegion) => ar.indicatorCoefficients, {
    nullable: true,
  })
  adminRegion: AdminRegion;

  @Index()
  @ManyToOne(
    () => Indicator,
    (indicator: Indicator) => indicator.indicatorCoefficients,
  )
  indicator!: Indicator;

  @Index()
  @ManyToOne(() => Material, (mat: Material) => mat.indicatorCoefficients)
  material!: Material;
}
