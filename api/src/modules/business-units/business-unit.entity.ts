import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

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
  columnsAllowedAsFilter: ['name', 'description', 'status'],
};

@Entity('business_unit')
@Tree('materialized-path')
export class BusinessUnit extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
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
    default: BUSINESS_UNIT_STATUS.ACTIVE,
  })
  @ApiProperty()
  status!: BUSINESS_UNIT_STATUS;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  metadata?: JSON;

  @OneToMany(
    () => SourcingLocation,
    (srcLoc: SourcingLocation) => srcLoc.material,
  )
  sourcingLocations: SourcingLocation[];
}
