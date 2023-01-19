import { useProfile } from 'hooks/profile';

import type { Permission } from './enums';

export function usePermissions() {
  const { data, isLoading } = useProfile();
  const roles = data?.roles[0];
  const role = roles?.name;
  const permissions = roles?.permissions;

  const hasPermissions = (permission: Permission) => {
    return !isLoading && !!permissions?.includes(permission);
  };

  return { role, permissions, hasPermissions, permissionsLoading: isLoading };
}
