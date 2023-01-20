import { BaseEntity, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { PERMISSIONS } from 'modules/authorization/permissions/permissions.enum';
import { Role } from 'modules/authorization/roles/role.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('permissions')
export class Permission extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({
    type: 'varchar',
    enum: PERMISSIONS,
    unique: true,
    default: PERMISSIONS.CAN_CREATE_SCENARIO,
  })
  action!: PERMISSIONS;

  @ManyToMany(() => Role, (role: Role) => role.permissions)
  roles: Role[];

  //TODO: Add a default flag? It might be useful
}
