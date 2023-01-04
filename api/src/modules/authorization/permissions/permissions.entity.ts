import { BaseEntity, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { PERMISSIONS } from 'modules/authorization/permissions/permissions.enum';

@Entity('permissions')
export class Permissions extends BaseEntity {
  @ApiProperty({ type: PERMISSIONS, enum: PERMISSIONS })
  @PrimaryColumn({ type: 'varchar', enum: PERMISSIONS, default: null })
  action!: ROLES;
}

// TODO: relation with roles
