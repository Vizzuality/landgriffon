import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { ROLES_KEY } from 'decorators/roles.decorator';
import { Role } from 'modules/authorization/roles/role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles: ROLES[] = this.reflector.getAllAndOverride<ROLES[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    // If the triggered endpoint does not require any roles, proceed with request
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role: ROLES) =>
      user.roles?.map((role: Role) => role.name).includes(role),
    );
  }
}
