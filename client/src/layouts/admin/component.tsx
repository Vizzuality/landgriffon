import Head from 'next/head';

import ApplicationLayout from 'layouts/application';
import Tabs, { TabsType } from 'components/tabs';
import PageLoading from 'containers/page-loading';

import { AdminLayoutProps } from './types';

export const TABS: TabsType = {
  DATA: {
    name: 'Data',
    href: '/admin',
  },
  TARGETS: {
    name: 'Targets',
    href: '/admin/targets',
  },
  USERS: {
    name: 'Users',
    href: '/admin/users',
  },
  SETTINGS: {
    name: 'Settings',
    href: '/admin/settings',
  },
};

const AdminLayout: React.FC<AdminLayoutProps> = ({
  loading = false,
  currentTab,
  headerButtons,
  children,
}: AdminLayoutProps) => (
  <ApplicationLayout>
    <Head>
      <title>Admin - Landgriffon</title>
    </Head>
    <main className="relative p-6 md:pl-12 min-h-screen">
      {loading && <PageLoading />}

      <h1 className="text-center md:text-left">Admin</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 border-b border-gray-200">
        <Tabs bottomBorder={false} activeTab={currentTab} tabs={TABS} />
        {headerButtons && <div className="flex gap-3 mt-4 md:-mt-4 mb-4">{headerButtons}</div>}
      </div>

      <section>{children}</section>
    </main>
  </ApplicationLayout>
);

export default AdminLayout;
