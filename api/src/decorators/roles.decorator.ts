import { SetMetadata } from '@nestjs/common';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { CustomDecorator } from '@nestjs/common/decorators/core/set-metadata.decorator';

/**
 * name of the property that will hold the roles object array
 */
export const ROLES_KEY: string = 'roles';

export const RequiredRoles = (...roles: ROLES[]): CustomDecorator =>
  SetMetadata(ROLES_KEY, roles);

// TODO: Add custom decorator to set metadata for permissions
