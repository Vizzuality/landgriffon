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
    <section
      aria-labelledby="primary-heading"
      className="min-w-0 flex-1 h-screen flex flex-col overflow-y-auto p-6 pb-16 lg:pb-0"
    >
      {loading && <PageLoading />}

      <header className="sticky top-0 bg-gray-100 z-10 pt-6">
        <h1 className="text-center md:text-left">Admin</h1>

        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200">
          <Tabs bottomBorder={false} activeTab={currentTab} tabs={ADMIN_TABS} />
          {headerButtons && (
            <div className="flex gap-3 mt-4 mb-4 md:-mt-2 md:mb-2">{headerButtons}</div>
          )}
        </div>
      </header>

      <section className="pt-4 mt-4 pb-6 md:py-1">{children}</section>
    </section>
  </ApplicationLayout>
);

export default AdminLayout;
