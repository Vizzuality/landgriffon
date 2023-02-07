import { RoleName } from './enums';

import { useProfile } from 'hooks/profile';

import type { Permission } from './enums';

export function usePermissions(creatorId?: string) {
  const { data, isLoading } = useProfile();

  const roles: RoleName[] = [];
  const permissions: Permission[] = [];

  data?.roles?.forEach((role) => {
    roles.push(role.name);
    role.permissions?.forEach((permission) => {
      if (permission.action) {
        permissions.push(permission.action);
      }
    });
  });

  const hasRole = (role: RoleName) => {
    return !isLoading && !!roles?.includes(role);
  };

  /**
   * Function to determine if a user is allowed to perform an action.
   * For CREATE actions add param needsCreatorPermission=false, so it will not check the 'creatorId'
   */
  const hasPermission = (permissionName: Permission, needsCreatorPermission = true) => {
    // The user has permission
    let permission = permissions?.includes(permissionName);
    // The user is creator of the entity and has permission (for delete and update actions)
    if (needsCreatorPermission) {
      permission = permission && creatorId === data?.id;
    }
    // Admin always has permission
    return !isLoading && (hasRole(RoleName.ADMIN) || permission);
  };

  return { roles, hasRole, permissions, hasPermission, isLoading };
}
