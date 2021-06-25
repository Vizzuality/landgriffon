import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Material } from 'modules/materials/material.entity';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LAYERS_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export const LayerResource: BaseServiceResource = {
  className: 'Layer',
  name: {
    singular: 'Layer',
    plural: 'Layers',
  },
  entitiesAllowedAsIncludes: [],
};

@Entity()
export class Layer extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  text?: string;

  @ApiPropertyOptional()
  @Column({ type: 'jsonb', nullable: true })
  layerManagerConfig?: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: LAYERS_STATUS,
    enumName: 'entityStatus',
    default: LAYERS_STATUS.INACTIVE,
  })
  status!: LAYERS_STATUS;

  @ApiPropertyOptional()
  @Column({ type: 'jsonb', nullable: true })
  metadata?: JSON;

  @OneToMany(() => Material, (materials: Material) => materials.layerId)
  materials: Material[];
}
