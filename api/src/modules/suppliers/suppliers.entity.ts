import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

export enum SUPPLIER_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

@Entity()
export class Suppliers extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'ltree', nullable: true, unique: true })
  path: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: SUPPLIER_STATUS, enumName: 'entity_status' })
  status: SUPPLIER_STATUS;

  @Column({ type: 'jsonb', nullable: true })
  metadata: JSON;
}
