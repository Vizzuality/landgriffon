import ApplicationLayout from 'layouts/application';
import Link from 'next/link';
import { useRouter } from 'next/router';
import classNames from 'classnames';

import { ADMIN_TABS } from './constants';

import type { AdminLayoutProps } from './types';

const AdminLayout: React.FC<AdminLayoutProps> = ({ title = 'Admin', children }) => {
  const { pathname } = useRouter();

  return (
    <ApplicationLayout>
      <section
        aria-labelledby="primary-heading"
        className="flex flex-col flex-1 h-screen min-w-0 overflow-y-auto bg-gray-100"
      >
        <header className="sticky top-0 z-20 bg-navy-400">
          <div className="flex items-stretch justify-between px-12 bg-white border-b border-gray-100 rounded-tl-3xl">
            <h1 className="text-left mt-8">{title}</h1>

            <nav className="flex space-x-10 text-sm mt-12">
              {Object.values(ADMIN_TABS).map((tab) => (
                <Link key={tab.href} href={tab.href}>
                  <a
                    className={classNames('flex items-center pb-5 -mb-[2px]', {
                      'text-navy-400 border-b-2 border-primary': pathname === tab.href,
                    })}
                    data-testid="admin-menu-item"
                    data-testisactive={pathname === tab.href}
                  >
                    {tab.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <section className="flex-1 px-12 py-6">{children}</section>
      </section>
    </ApplicationLayout>
  );
};

export default AdminLayout;
