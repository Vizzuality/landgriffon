import { Injectable } from '@nestjs/common';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { Role } from 'modules/authorization/roles/role.entity';
import { PERMISSIONS } from 'modules/authorization/permissions/permissions.enum';
import { Permission } from 'modules/authorization/permissions/permissions.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { genSalt, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { CreateUserDTO } from 'modules/users/dto/create.user.dto';

/**
 * @TODO: In the future we will let the user to create custom roles and assign N permissions to it,
 *        so this module will need to expose a controller and extend nestjs-base-service to let the user
 *        interact with it
 */

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * @description: Still is not defined what actions a user can perform in the platform, what claims we want to grant by default,
   *               or even how do we want to do this through a UI. Given the unknowns, for the time being
   *               we will grant a basic user role and basic permissions we have over scenario creation
   */

  async assignDefaultAuthorization(): Promise<Role[]> {
    const defaultUserRole: Role = await this.roleRepository.findOneOrFail({
      where: { name: ROLES.USER },
    });
    return [defaultUserRole];
  }

  createPermissionsFromEnum(permissions: PERMISSIONS[]): Permission[] {
    return Object.values(permissions).map(
      (perm: string) => ({ action: perm } as Permission),
    );
  }

  assignRoles(roles: ROLES[]): Role[] {
    return roles.map((role: ROLES) => ({ name: role } as Role));
  }

  /**
   * @description: Generate minimal roles and basic permissions when app starts
   */

  async seedRolesAndPermissions(): Promise<any> {
    const permissions: Permission[] = Object.values(PERMISSIONS).map(
      (permission: PERMISSIONS) =>
        ({
          action: permission,
        } as Permission),
    );

    const roles: Role[] = Object.values(ROLES).map(
      (role: ROLES) =>
        ({
          name: role,
        } as Role),
    );

    await this.permissionRepository.save(permissions);

    await this.roleRepository.save(roles);

    return this.generateDefaultRoleWithPermissions();
  }

  /**
   * @description: Relate basic permissions with basic role
   */

  async generateDefaultRoleWithPermissions(): Promise<Role> {
    const defaultRole: Role = await this.roleRepository.findOneOrFail({
      where: { name: ROLES.USER },
    });
    defaultRole.permissions = await this.permissionRepository.find({
      where: { action: In(Object.values(PERMISSIONS)) },
    });

    return this.roleRepository.save(defaultRole);
  }

  async generatePassword(salt: string, password: string): Promise<string> {
    return await hash(password, salt);
  }

  async generateRandomPassword(salt: string): Promise<string> {
    const randomPassword: string = randomBytes(12).toString('hex');
    return await hash(randomPassword, salt);
  }

  async generateSalt(): Promise<string> {
    return genSalt();
  }

  async assignPassword(dto: CreateUserDTO, salt: string): Promise<string> {
    let password: string;
    if ('password' in dto && dto.password) {
      password = await this.generatePassword(salt, dto.password);
    } else {
      password = await this.generateRandomPassword(salt);
    }
    return password;
  }
}
