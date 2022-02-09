import {
  Column,
  Entity,
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
import { MaterialToH3 } from 'modules/materials/material-to-h3.entity';

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

  @Column()
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

  @OneToMany(
    () => MaterialToH3,
    (materialToH3: MaterialToH3) => materialToH3.material,
  )
  materialToH3s: MaterialToH3[];
}

export class ImportedMaterialsListResponse {
  @ApiProperty({
    type: 'object',
    properties: {
      totalItems: {
        type: 'number',
        example: 45,
      },
      totalPages: {
        type: 'number',
        example: 9,
      },
      size: {
        type: 'number',
        example: 5,
      },
      page: {
        type: 'number',
        example: 1,
      },
    },
  })
  'meta': Record<string, unknown>;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          example: 'materials',
        },
        id: {
          type: 'string',
          example: 'a2428cbb-e1b1-4313-ad85-9579b260387f',
        },
        attributes: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'bananas',
            },
            country: {
              type: 'string',
              example: 'Japan',
            },
            businessUnit: {
              type: 'string',
              example: 'Accessories',
            },
            supplier: {
              type: 'string',
              example: 'Cargill',
            },
            producer: {
              type: 'string',
              example: 'Moll',
            },
            locationtype: {
              type: 'string',
              example: 'point of production',
            },
          },
        },
      },
    },
  })
  'data': [];
}
