import { useProfile } from 'hooks/profile';

import type { Permission, RoleName } from './enums';

export function usePermissions() {
  const { data, isLoading } = useProfile();

  const roles: RoleName[] = [];
  const permissions: Permission[] = [];

  data?.roles?.forEach((role) => {
    roles.push(role.name);
    role.permissions?.forEach((permission) => permissions.push(permission));
  });

  const hasRole = (role: RoleName) => {
    return !isLoading && !!roles?.includes(role);
  };

  const hasPermission = (permission: Permission) => {
    return !isLoading && !!permissions?.includes(permission);
  };

  return { roles, hasRole, permissions, hasPermission, permissionsLoading: isLoading };
}
