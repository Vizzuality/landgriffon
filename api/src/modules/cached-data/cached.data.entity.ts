import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { ApiProperty } from '@nestjs/swagger';
import { BaseServiceResource } from 'types/resource.interface';

export enum CACHED_DATA_TYPE {
  RAW_INDICATOR_VALUE_GEOREGION = 'rawImpactedValueGeoRegion',
  RAW_MATERIAL_VALUE_GEOREGION = 'rawMaterialValueGeoRegion',
  RAW_VALUES_GEOREGION = 'rawValuesGeoRegion',
}

export const cachedDataResource: BaseServiceResource = {
  className: 'CachedData',
  name: {
    singular: 'cachedData',
    plural: 'cachedDatas',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['hashedKey', 'type'],
};

@Entity('cached_data')
@Index(['hashedKey', 'type'], { unique: true })
export class CachedData extends TimestampedBaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: false })
  hashedKey!: string;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: false })
  data!: object;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: CACHED_DATA_TYPE,
  })
  type!: CACHED_DATA_TYPE;
}
