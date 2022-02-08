import Head from 'next/head';

import ApplicationLayout from 'layouts/application';
import Tabs from 'components/tabs';
import PageLoading from 'containers/page-loading';

import { AdminLayoutProps } from './types';
import { ADMIN_TABS } from './constants';

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
    <main className="relative p-6 md:pl-12 min-h-screen bg-gray-100">
      {loading && <PageLoading />}

      <h1 className="text-center md:text-left">Admin</h1>

      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200">
        <Tabs bottomBorder={false} activeTab={currentTab} tabs={ADMIN_TABS} />
        {headerButtons && (
          <div className="flex gap-3 mt-4 mb-4 md:-mt-2 md:mb-2">{headerButtons}</div>
        )}
      </div>

      <section className="pt-4 mt-4 pb-1 md:py-1">{children}</section>
    </main>
  </ApplicationLayout>
);

export default AdminLayout;
