import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { User } from 'modules/users/user.entity';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IndicatorSource } from 'modules/indicator-sources/indicator-source.entity';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';

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
export class IndicatorCoefficient extends TimestampedBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id!: string;

  @Column({ type: 'int', nullable: true })
  @ApiPropertyOptional()
  value?: number;

  @Column({ type: 'int' })
  @ApiProperty()
  year!: number;

  @ManyToOne(() => AdminRegion, (ar: AdminRegion) => ar.indicatorCoefficients)
  @ApiPropertyOptional()
  adminRegion: AdminRegion;

  @ManyToOne(
    () => IndicatorSource,
    (indicatorSource: IndicatorSource) => indicatorSource.indicatorCoefficients,
    {
      eager: false,
      onDelete: 'CASCADE',
    },
  )
  indicatorSource!: IndicatorSource;

  @Column()
  @ApiProperty()
  indicatorSourceId!: string;

  @ManyToOne(() => User, (user: User) => user.indicatorCoefficients)
  @ApiProperty({ type: () => User })
  user!: User;

  @ManyToOne(
    () => Indicator,
    (indicator: Indicator) => indicator.indicatorCoefficients,
  )
  @ApiProperty()
  indicator!: Indicator;

  @ManyToOne(() => Material, (mat: Material) => mat.indicatorCoefficients)
  @ApiProperty()
  material!: Material;
}
