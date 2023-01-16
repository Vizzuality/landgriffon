import { Inject, Injectable, Logger } from '@nestjs/common';
import { NJRS_REQUEST } from 'nj-request-scope';
import { User } from 'modules/users/user.entity';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { Role } from 'modules/authorization/roles/role.entity';
import { RequestWithAuthenticatedUser } from 'app.controller';

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

  isUserAdmin(): boolean {
    console.log(this.request.user);
    return this.request.user.roles.some(
      (role: Role) => role.name === ROLES.ADMIN,
    );
  }

  getUserId(): string {
    return this.request.user.id;
  }
}
