import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { IsOptional, IsString } from 'class-validator';

export enum SUPPLIER_TYPES {
  T1SUPPLIER = 't1supplier',
  PRODUCER = 'producer',
}

export enum SUPPLIER_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export const supplierResource: BaseServiceResource = {
  className: 'Supplier',
  name: {
    singular: 'supplier',
    plural: 'suppliers',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['name', 'description', 'status'],
};

@Entity()
@Tree('materialized-path')
export class Supplier extends TimestampedBaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TreeChildren()
  children: Supplier[];

  @TreeParent()
  parent: Supplier;

  @IsString()
  @IsOptional()
  mpath?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  parentId?: string;

  @ApiProperty()
  @Column({ nullable: false })
  name!: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'varchar' })
  companyId: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: SUPPLIER_STATUS,
    default: SUPPLIER_STATUS.ACTIVE,
  })
  status!: SUPPLIER_STATUS;

  @ApiPropertyOptional()
  @Column({ type: 'jsonb', nullable: true })
  metadata?: JSON;

  @OneToMany(
    () => SourcingLocation,
    (srcLoc: SourcingLocation) => srcLoc.material,
  )
  sourcingLocations: SourcingLocation[];
}
