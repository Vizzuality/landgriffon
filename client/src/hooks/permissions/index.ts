import { useUsersControllerUserMetadata } from '@/types/generated/user';
import { RoleName, Permission } from '@/types/generated/api.schemas';

export function usePermissions() {
  const { data, isLoading } = useUsersControllerUserMetadata({
    query: {
      select: (data) => ({
        id: data?.data?.id,
        ...data?.data?.attributes,
      }),
    },
  });

  const roles: RoleName[] = [];
  const permissions: Permission['action'][] = [];

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
  const hasPermission = (permissionName: Permission['action'], creatorId?: string) => {
    // The user has permission
    let permission = permissions?.includes(permissionName);
    // The user is creator of the entity and has permission (for delete and update actions)
    if (!!creatorId) {
      permission = permission && creatorId === data?.id;
    }
    // Admin always has permission
    return !isLoading && (hasRole(RoleName.admin) || permission);
  };

  return { roles, hasRole, permissions, hasPermission, isLoading };
}
