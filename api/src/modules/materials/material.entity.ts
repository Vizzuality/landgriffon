import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { Layer } from 'modules/layers/layer.entity';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';

export enum MATERIALS_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export const materialResource: BaseServiceResource = {
  className: 'Material',
  name: {
    singular: 'material',
    plural: 'materials',
  },
  entitiesAllowedAsIncludes: ['children', 'layer'],
  columnsAllowedAsFilter: [
    'name',
    'description',
    'status',
    'layerId',
    'hsCodeId',
    'earthstatId',
    'mapspamId',
    'metadata',
  ],
};

@Entity()
@Tree('materialized-path')
export class Material extends TimestampedBaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @TreeChildren()
  children: Material[];

  @TreeParent()
  parent: Material;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  parentId?: string;

  @Column({ nullable: false })
  @ApiProperty()
  name!: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  description?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  hsCodeId?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  earthstatId?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  mapspamId?: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: MATERIALS_STATUS,
    default: MATERIALS_STATUS.ACTIVE,
  })
  status!: MATERIALS_STATUS;

  @ApiPropertyOptional()
  @Column({ type: 'jsonb', nullable: true })
  metadata?: JSON;

  @OneToMany(
    () => IndicatorCoefficient,
    (ic: IndicatorCoefficient) => ic.material,
  )
  indicatorCoefficients: IndicatorCoefficient[];

  @OneToMany(
    () => SourcingLocation,
    (srcLoc: SourcingLocation) => srcLoc.material,
  )
  sourcingLocations: SourcingLocation[];

  @ManyToOne(() => Layer, (layer: Layer) => layer.materials, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'layerId' })
  layer: Layer;

  /**
   * @debt: This columns should not be nullable but is necessary for the time being
   * to load material data since we have no layer data yet
   */
  @ApiProperty()
  @Column()
  layerId!: string;

  @OneToOne(() => H3Data, { nullable: true })
  @JoinColumn()
  h3Grid?: H3Data;
}
