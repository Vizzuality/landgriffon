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
};

@Entity()
export class GeoRegion extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id!: string;

  @Column({ type: 'text', array: true, nullable: true })
  @ApiPropertyOptional()
  h3Compact?: string[];

  @Column({ nullable: true })
  @ApiPropertyOptional()
  name?: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  theGeom?: JSON;

  @OneToMany(() => AdminRegion, (adminReg: AdminRegion) => adminReg.geoRegionId)
  adminRegions: AdminRegion[];
}
