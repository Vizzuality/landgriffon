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
}: AdminLayoutProps) => (
  <ApplicationLayout>
    <section
      aria-labelledby="primary-heading"
      className="min-w-0 flex-1 h-screen flex flex-col overflow-y-auto bg-gray-100"
    >
      {loading && <PageLoading />}

      <header className="sticky top-0 bg-primary z-20">
        <div className="flex items-stretch justify-between px-12 rounded-tl-3xl bg-white border-b border-gray-100">
          <h1 className="text-left my-8">{title}</h1>

          <div className="flex text-sm space-x-10">
            {Object.values(ADMIN_TABS).map((tab) => (
              <Link key={tab.name} href={tab.href}>
                <a
                  className={classNames('flex items-center -mb-2px', {
                    'text-primary border-b-2 border-primary': currentTab && tab === currentTab,
                  })}
                >
                  {tab.name}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </header>

      <section className="px-12 py-6">{children}</section>
    </section>
  </ApplicationLayout>
);

export default AdminLayout;
