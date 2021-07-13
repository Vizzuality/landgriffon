import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @Column({ type: 'int', nullable: true })
  @ApiPropertyOptional()
  unit1?: number;

  @Column({ type: 'int', nullable: true })
  @ApiPropertyOptional()
  unit2?: number;

  @Column({ type: 'float', nullable: true })
  @ApiPropertyOptional()
  factor?: number;

  /**
   * @note: 'unit_2 = unit_1 * factor'] // 1000
   */
}
