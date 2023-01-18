import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { NJRS_REQUEST } from 'nj-request-scope';
import { User } from 'modules/users/user.entity';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { Role } from 'modules/authorization/roles/role.entity';
import { RequestWithAuthenticatedUser } from 'app.controller';
import { BaseEntity, DataSource, Repository } from 'typeorm';
import { PERMISSIONS } from 'modules/authorization/permissions/permissions.enum';
import { Permission } from 'modules/authorization/permissions/permissions.entity';

/**
 * @description: Singleton injectable service that will hold the current async context's request, using
 *               https://github.com/kugacz/nj-request-scope
 *               So we can said request's user and perform auth magic with it
 *
 *
 */
// TODO: This is a first version to comply minimal requirements. We need to validate based on permissions

@Injectable()
export class AccessControl {
  logger: Logger = new Logger(AccessControl.name);

  constructor(
    @Inject(NJRS_REQUEST)
    private readonly request: RequestWithAuthenticatedUser,
    private readonly dataSource: DataSource,
  ) {}

  static createRolesFromEnum(roles: ROLES[]): Role[] {
    return roles.map((role: ROLES) => ({ name: role } as Role));
  }

  /**
   * @description: We can use this to build more complex or more module / entity specific layers of authorisation
   */

  getUser(): User {
    return this.request.user;
  }

  getUserRoles(): Role[] {
    return this.request.user.roles;
  }

  canUser(permissionsToCheck: PERMISSIONS[]): any {
    if (!this.request.user.roles.length) {
      throw new UnauthorizedException(
        `User with Id: ${this.getUserId()} has no assigned roles`,
      );
    }
    const allowedActions: PERMISSIONS[] = this.request.user.roles
      .map((role: Role): Permission[] => role.permissions)
      .reduce((acc: any[], cur: any): Permission[] => acc.concat(cur), [])
      .map((permission: Permission) => permission.action as PERMISSIONS);

    if (
      allowedActions.some((action: PERMISSIONS) =>
        permissionsToCheck.includes(action),
      )
    ) {
      const forbiddenMessage: string = `User with Id: ${this.getUserId()} has no ${permissionsToCheck.join(
        ', ',
      )} assigned`;
      this.logger.warn(forbiddenMessage);
      throw new ForbiddenException(forbiddenMessage);
    }
  }

  isUserAdmin(): boolean {
    return this.request.user.roles.some(
      (role: Role) => role.name === ROLES.ADMIN,
    );
  }

  getUserId(): string {
    return this.request.user.id;
  }

  getBaseRepositoryFor(entity: typeof BaseEntity): Repository<any> {
    return this.dataSource.getRepository(entity);
  }
}
