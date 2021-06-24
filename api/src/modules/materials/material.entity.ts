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
import { Layer } from 'modules/layers/layer.entity';

export enum MATERIALS_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

@Entity()
@Tree('materialized-path')
export class Material extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TreeChildren()
  children: Material[];

  @TreeParent()
  parent: Material;

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

  @ManyToOne(() => Layer, (layers: Layer) => layers.id)
  @JoinColumn({ name: 'layers_id' })
  layersId: string;
}
