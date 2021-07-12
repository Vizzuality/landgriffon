import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
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
  entitiesAllowedAsIncludes: [],
};

@Entity()
@Tree('materialized-path')
export class Material extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @TreeChildren()
  children: Material[];

  @TreeParent()
  parent: Material;

  @Column({ nullable: false })
  @ApiProperty()
  name!: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: MATERIALS_STATUS,
    enumName: 'entity_status',
    default: MATERIALS_STATUS.INACTIVE,
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

  @ManyToOne(() => Layer, (layer: Layer) => layer.materials, { eager: false })
  layer: Layer;

  @ApiProperty()
  @Column()
  layerId!: string;
}
