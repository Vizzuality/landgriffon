import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { Materials } from '../materials/materials.entity';

export enum LAYERS_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

@Entity()
export class Layers extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @OneToMany(() => Materials, (materials: Materials) => materials.layersId)
  id: string;

  @Column({ nullable: true })
  text: string;

  @Column({ name: 'layer_manager_config', type: 'jsonb', nullable: true })
  layerManagerConfig: string;

  @Column({
    type: 'enum',
    enum: LAYERS_STATUS,
    enumName: 'entity_status',
    default: LAYERS_STATUS.INACTIVE,
  })
  status: LAYERS_STATUS;

  @Column({ type: 'jsonb', nullable: true })
  metadata: JSON;
}
