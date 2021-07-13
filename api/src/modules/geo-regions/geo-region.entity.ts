import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const geoRegionResource: BaseServiceResource = {
  className: 'GeoRegion',
  name: {
    singular: 'geoRegion',
    plural: 'geoRegions',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['name'],
};

@Entity()
export class GeoRegion extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', array: true, nullable: true })
  h3Compact?: string[];

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional()
  name?: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  theGeom?: JSON;

  @ApiPropertyOptional()
  @OneToMany(() => AdminRegion, (adminReg: AdminRegion) => adminReg.geoRegion)
  adminRegions?: AdminRegion[];
}
