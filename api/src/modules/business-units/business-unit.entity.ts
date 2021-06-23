import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  TreeChildren,
  TreeParent,
  Tree,
} from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BUSINESS_UNIT_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export const businessUnitResource: BaseServiceResource = {
  className: 'BusinessUnit',
  name: {
    singular: 'businessUnit',
    plural: 'businessUnits',
  },
  entitiesAllowedAsIncludes: [],
};

@Entity()
@Tree('materialized-path')
export class BusinessUnit extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @TreeChildren()
  children: BusinessUnit[];

  @TreeParent()
  parent: BusinessUnit;

  @Column({ nullable: false })
  @ApiProperty()
  name!: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  description?: string;

  @Column({
    type: 'enum',
    enum: BUSINESS_UNIT_STATUS,
    enumName: 'entity_status',
    default: BUSINESS_UNIT_STATUS.INACTIVE,
  })
  @ApiProperty()
  status!: BUSINESS_UNIT_STATUS;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  metadata?: JSON;
}
