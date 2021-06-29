import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
};

@Entity()
export class Supplier extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'ltree', nullable: true, unique: true })
  path?: string;

  @ApiProperty()
  @Column({ nullable: false })
  name!: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  description?: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: SUPPLIER_STATUS,
    enumName: 'entityStatus',
    default: SUPPLIER_STATUS.INACTIVE,
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
