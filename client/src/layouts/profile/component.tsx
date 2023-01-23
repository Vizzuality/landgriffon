import { USER_TABS } from './constants';

import AdminLayout from 'layouts/admin';

import type { AdminLayoutProps } from 'layouts/admin/types';

const UserLayout: React.FC<AdminLayoutProps> = ({ children, ...props }) => (
  <AdminLayout {...props} adminTabs={USER_TABS}>
    {children}
  </AdminLayout>
);

export default UserLayout;
