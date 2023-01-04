import { Injectable } from '@nestjs/common';
import { Role } from 'modules/authorization/roles/role.entity';
import { DataSource } from 'typeorm';
import { ROLES } from 'modules/authorization/roles/roles.enum';

/**
 * @description: Service to create roles in the DB at API init
 * @note: Should we create both the entity and populate the values through migrations?
 */

@Injectable()
export class RoleSeeder {
  constructor(private dataSource: DataSource) {}
  async seedRoles(): Promise<Role[]> {
    const roles: Role[] = Object.values(ROLES).map(
      (role: ROLES) =>
        ({
          name: role,
        } as Role),
    );
    return this.dataSource.getRepository(Role).save(roles);
  }
}
