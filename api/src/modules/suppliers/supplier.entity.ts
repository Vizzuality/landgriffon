import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { BaseServiceResource } from '../../types/resource.interface';

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
  id: string;

  @Column({ type: 'ltree', nullable: true, unique: true })
  path: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SUPPLIER_STATUS,
    enumName: 'entity_status',
    default: SUPPLIER_STATUS.INACTIVE,
  })
  status: SUPPLIER_STATUS;

  @Column({ type: 'jsonb', nullable: true })
  metadata: JSON;
}
