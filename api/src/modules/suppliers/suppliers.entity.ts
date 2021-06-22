import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { entityStatus } from 'utils/entity-status.enum';

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

  @Column({ type: 'enum', enum: entityStatus, enumName: 'entity_status' })
  status: entityStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: JSON;
}
