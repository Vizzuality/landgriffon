import { BaseEntity, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PERMISSIONS } from 'modules/authorization/permissions/permissions.enum';

@Entity('permissions')
export class Permission extends BaseEntity {
  @ApiProperty({ type: PERMISSIONS, enum: PERMISSIONS })
  @PrimaryColumn({ type: 'varchar', enum: PERMISSIONS })
  action!: PERMISSIONS;
}

// TODO: relation with roles
