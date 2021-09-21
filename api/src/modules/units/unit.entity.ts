import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Indicator } from 'modules/indicators/indicator.entity';
import { UnitConversion } from 'modules/unit-conversions/unit-conversion.entity';

export const unitResource: BaseServiceResource = {
  className: 'Unit',
  name: {
    singular: 'unit',
    plural: 'units',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['name', 'description', 'symbol'],
};

@Entity('units')
export class Unit extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id!: string;

  @Column({ type: 'character varying', nullable: false, unique: true })
  @ApiProperty()
  name!: string;

  @Column({ type: 'text', nullable: true })
  shortName!: string;

  @Column({ type: 'character varying', nullable: true })
  @ApiProperty()
  symbol: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional()
  description?: number;

  @OneToMany(() => Indicator, (indicator: Indicator) => indicator.unit)
  @JoinColumn()
  indicators!: Indicator[];

  @OneToMany(
    () => UnitConversion,
    (unitConversion: UnitConversion) => unitConversion.unit,
  )
  @JoinColumn()
  unitConversions: UnitConversion[];
}
