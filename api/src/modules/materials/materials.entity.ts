import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { entityStatus } from 'utils/entity-status.enum';
import { Layers } from '../layers/layers.entity';

@Entity()
export class Materials extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'ltree', nullable: false, unique: true })
  path: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: entityStatus, enumName: 'entity_status' })
  status: entityStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: JSON;

  @ManyToOne(() => Layers, (layers: Layers) => layers.id)
  @JoinColumn({ name: 'layers_id' })
  layersId: string;
}
