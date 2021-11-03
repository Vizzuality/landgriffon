import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
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
  entitiesAllowedAsIncludes: ['children'],
  columnsAllowedAsFilter: [
    'name',
    'description',
    'status',
    'hsCodeId',
    'earthstatId',
    'mapspamId',
    'metadata',
    'h3Grid',
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
  parent: Material | null;

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

  @Column({ type: 'text', nullable: true })
  datasetId: string;

  @ManyToOne(() => H3Data, (h3grid: H3Data) => h3grid.id, {
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  producer: H3Data;
  @Column({ nullable: true, unique: false })
  producerId: string;

  @ManyToOne(() => H3Data, (h3grid: H3Data) => h3grid.id, {
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  harvest: H3Data;
  @Column({ nullable: true, unique: false })
  harvestId: string;
}
