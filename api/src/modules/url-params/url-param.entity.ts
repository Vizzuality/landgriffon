import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty } from '@nestjs/swagger';

export const urlParamResource: BaseServiceResource = {
  className: 'UrlParam',
  name: {
    singular: 'urlParam',
    plural: 'urlParams',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: [],
};

@Entity()
export class UrlParam extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id!: string;

  @Column({ type: 'jsonb' })
  @ApiProperty()
  params!: JSON;
}
