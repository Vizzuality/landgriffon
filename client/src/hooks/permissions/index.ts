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

  const hasPermission = (permission: Permission) => {
    // If is admin or if has the permission or if is the creator of the entity
    return (
      !isLoading &&
      (hasRole(RoleName.ADMIN) ||
        permissions?.includes(permission) ||
        (!!creatorId && creatorId === data.id))
    );
  };

  return { roles, hasRole, permissions, hasPermission, isLoading };
}
