import { Injectable } from '@nestjs/common';
import { Role } from 'modules/authorization/role.entity';
import { getManager } from 'typeorm';
import { ROLES } from 'modules/authorization/roles/roles.enum';

/**
 * @description: Service to create roles in the DB at API init
 * @note: Should we create both the entity and populate the values through migrations?
 */

@Injectable()
export class RoleSeeder {
  async seedRoles(): Promise<Role[]> {
    const roles: Role[] = Object.values(ROLES).map(
      (role: ROLES) =>
        ({
          name: role,
        } as Role),
    );
    return getManager().getRepository(Role).save(roles);
  }
}
