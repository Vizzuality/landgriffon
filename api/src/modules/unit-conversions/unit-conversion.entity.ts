import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Unit } from 'modules/units/unit.entity';

export const unitConversionResource: BaseServiceResource = {
  className: 'UnitConversion',
  name: {
    singular: 'unitConversion',
    plural: 'unitConversions',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['unit1', 'unit2', 'factor'],
};

@Entity()
export class UnitConversion extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id!: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional()
  unit1?: number;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional()
  unit2?: number;

  @Column({ type: 'float', nullable: true })
  @ApiPropertyOptional()
  factor?: number;

  @OneToOne(() => Unit, (unit: Unit) => unit.id)
  @JoinColumn()
  unit: Unit;

  /**
   * @note: 'unit_2 = unit_1 * factor'] // 1000
   */
}
