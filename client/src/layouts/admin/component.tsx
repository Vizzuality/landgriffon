import ApplicationLayout from 'layouts/application';
import Tabs from 'components/tabs';
import PageLoading from 'containers/page-loading';

import { AdminLayoutProps } from './types';
import { ADMIN_TABS } from './constants';

const AdminLayout: React.FC<AdminLayoutProps> = ({
  loading = false,
  currentTab,
  title = 'Admin',
  children,
}: AdminLayoutProps) => (
  <ApplicationLayout>
    <section
      aria-labelledby="primary-heading"
      className="min-w-0 flex-1 h-screen flex flex-col overflow-y-auto bg-gray-100"
    >
      {loading && <PageLoading />}

      <header className="sticky top-0 bg-primary z-10">
        <div className="flex items-center justify-between px-12 py-8 rounded-tl-3xl bg-white border-b border-gray-200">
          <h1 className="text-left">{title}</h1>

          <div className="flex flex-col md:flex-row justify-between items-center">
            <Tabs bottomBorder={false} activeTab={currentTab} tabs={ADMIN_TABS} />
          </div>
        </div>
      </header>

      <section className="px-12 py-6">{children}</section>
    </section>
  </ApplicationLayout>
);

export default AdminLayout;
