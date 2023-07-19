import { USER_TABS } from './constants';

import { usePermissions } from 'hooks/permissions';
import AdminLayout from 'layouts/admin';
import { RoleName } from 'hooks/permissions/enums';

import type { AdminLayoutProps } from 'layouts/admin/types';

const UserLayout: React.FC<AdminLayoutProps> = ({ children, ...props }) => {
  const { hasRole } = usePermissions();
  const isAdmin = hasRole(RoleName.ADMIN);

  const TABS = isAdmin
    ? USER_TABS
    : { ...USER_TABS, USERS: { ...USER_TABS.USERS, disabled: true } };

  return (
    <AdminLayout {...props} adminTabs={TABS}>
      {children}
    </AdminLayout>
  );
};

export default UserLayout;
