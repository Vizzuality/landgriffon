import Link from 'next/link';
import { useRouter } from 'next/router';
import classNames from 'classnames';

import {
  ADMIN_TABS,
  MENU_ITEM_STYLE,
  MENU_ITEM_ACTIVE_STYLE,
  MENU_ITEM_DISABLED_STYLE,
} from './constants';

import ApplicationLayout from 'layouts/application';
import { useLasTask } from 'hooks/tasks';

import type { AdminLayoutProps } from './types';

const AdminLayout: React.FC<AdminLayoutProps> = ({
  title = 'Admin',
  children,
  searchSection,
  adminTabs = ADMIN_TABS,
}) => {
  const { pathname } = useRouter();
  const { data: lastTask } = useLasTask();

  if (adminTabs.SCENARIOS) {
    adminTabs.SCENARIOS.disabled = !!(!lastTask || lastTask?.status === 'processing');
  }
  if (adminTabs.TARGETS) {
    adminTabs.TARGETS.disabled = !!(!lastTask || lastTask?.status === 'processing');
  }

  return (
    <ApplicationLayout>
      <section
        aria-labelledby="primary-heading"
        className="flex h-full w-full flex-col overflow-auto"
      >
        <header className="sticky top-0 z-10 bg-navy-600">
          <div className="rounded-tl-3xl bg-white  px-12">
            <div
              className={classNames('flex items-stretch justify-between', {
                'border-b border-gray-200': !!searchSection,
              })}
            >
              <h1 className="mt-8 text-left">{title}</h1>

              <nav className="mt-11 flex space-x-10 pb-0.5 text-sm" data-testid="admin-menu-list">
                {Object.values(adminTabs).map((tab) => {
                  if (tab.disabled) {
                    return (
                      <span
                        key={tab.href}
                        className={classNames(MENU_ITEM_STYLE, MENU_ITEM_DISABLED_STYLE)}
                        data-testid="admin-menu-item"
                        data-testisactive={false}
                        data-testname={`admin-menu-item-${tab.name}`}
                      >
                        {tab.name}
                      </span>
                    );
                  }
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={classNames(MENU_ITEM_STYLE, {
                        [MENU_ITEM_ACTIVE_STYLE]: pathname === tab.href,
                      })}
                      data-testid="admin-menu-item"
                      data-testisactive={pathname === tab.href}
                      data-testname={`admin-menu-item-${tab.name}`}
                    >
                      {tab.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            {!!searchSection && <div className="py-1.5">{searchSection}</div>}
          </div>
        </header>

        <section className="flex-1 p-6">{children}</section>
      </section>
    </ApplicationLayout>
  );
};

export default AdminLayout;
