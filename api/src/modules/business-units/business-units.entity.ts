import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { entityStatus } from 'utils/entity-status.enum';

@Entity()
export class BusinessUnits extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'ltree', nullable: false, unique: true })
  path: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: entityStatus, enumName: 'entity_status' })
  status: entityStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: JSON;
}
