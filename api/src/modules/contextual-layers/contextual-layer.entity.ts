import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { H3Data } from 'modules/h3-data/h3-data.entity';

export enum CONTEXTUAL_LAYER_CATEGORY {
  ENVIRONMENTAL_DATASETS = 'Environmental datasets',
  BUSINESS_DATASETS = 'Business datasets',
  FOOD_AND_AGRICULTURE = 'Food and agriculture',
  DEFAULT = 'Default',
}

export const businessUnitResource: BaseServiceResource = {
  className: 'ContextualLayer',
  name: {
    singular: 'contextualLayer',
    plural: 'contextualLayers',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['name', 'metadata', 'category'],
};

@Entity()
export class ContextualLayer extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata?: JSON;

  @Column({
    type: 'enum',
    enum: CONTEXTUAL_LAYER_CATEGORY,
    enumName: 'contextual_layer_category',
    default: CONTEXTUAL_LAYER_CATEGORY.DEFAULT,
  })
  category: CONTEXTUAL_LAYER_CATEGORY;

  @OneToMany(() => H3Data, (h3Data: H3Data) => h3Data.contextualLayer)
  h3Data: H3Data[];
}

export class ContextualLayerByCategory {
  category: CONTEXTUAL_LAYER_CATEGORY;

  layer: ContextualLayer;
}
