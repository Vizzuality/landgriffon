import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { entityStatus } from 'utils/entity-status.enum';

@Entity()
export class Layers extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  text: string;

  @Column({ name: 'layer_manager_config', type: 'jsonb', nullable: true })
  layerManagerConfig: string;

  @Column({ type: 'enum', enum: entityStatus, enumName: 'entity_status' })
  status: entityStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: JSON;
}
