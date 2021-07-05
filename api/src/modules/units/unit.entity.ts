import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const unitResource: BaseServiceResource = {
  className: 'Unit',
  name: {
    singular: 'unit',
    plural: 'units',
  },
  entitiesAllowedAsIncludes: [],
};

@Entity('units')
export class Unit extends BaseEntity {
  /**
   * @debt: Add relation to indicators
   */
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id!: string;

  @Column({ type: 'character varying', nullable: false, unique: true })
  @ApiProperty()
  name!: string;

  @Column({ type: 'character varying', nullable: true })
  @ApiPropertyOptional()
  symbol?: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional()
  description?: number;
}
