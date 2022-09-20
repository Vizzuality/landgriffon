import ApplicationLayout from 'layouts/application';
import Link from 'next/link';
import classNames from 'classnames';

import PageLoading from 'containers/page-loading';

import { ADMIN_TABS } from './constants';

import type { AdminLayoutProps } from './types';

const AdminLayout: React.FC<AdminLayoutProps> = ({
  loading = false,
  currentTab,
  title = 'Admin',
  children,
}) => (
  <ApplicationLayout>
    <section
      aria-labelledby="primary-heading"
      className="flex flex-col flex-1 h-screen min-w-0 overflow-y-auto bg-gray-100"
    >
      {loading && <PageLoading />}

      <header className="sticky top-0 z-20 bg-primary">
        <div className="flex items-stretch justify-between px-12 bg-white border-b border-gray-100 rounded-tl-3xl">
          <h1 className="my-8 text-left">{title}</h1>

          <div className="flex space-x-10 text-sm">
            {Object.values(ADMIN_TABS).map((tab) => (
              <Link key={tab.name} href={tab.href}>
                <a
                  className={classNames('flex items-center -mb-2px', {
                    'text-primary border-b-2 border-primary': currentTab && tab === currentTab,
                  })}
                  data-testid="admin-menu-item"
                  data-testisactive={currentTab && tab === currentTab}
                >
                  {tab.name}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </header>

      <section className="flex-1 px-12 py-6">{children}</section>
    </section>
  </ApplicationLayout>
);

export default AdminLayout;
