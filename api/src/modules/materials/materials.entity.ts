import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { Layers } from '../layers/layers.entity';

export enum MATERIALS_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

@Entity()
@Tree('materialized-path')
export class Materials extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TreeChildren()
  children: Materials[];

  @TreeParent()
  parent: Materials;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: MATERIALS_STATUS,
    enumName: 'entity_status',
    default: MATERIALS_STATUS.INACTIVE,
  })
  status: MATERIALS_STATUS;

  @Column({ type: 'jsonb', nullable: true })
  metadata: JSON;

  @ManyToOne(() => Layers, (layers: Layers) => layers.id)
  @JoinColumn({ name: 'layers_id' })
  layersId: string;
}
