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
import { usePermissions } from 'hooks/permissions';

import type { TabType } from 'components/tabs';
import type { AdminLayoutProps } from './types';

const AdminLayout: React.FC<AdminLayoutProps> = ({
  title = 'Admin',
  children,
  adminTabs = ADMIN_TABS,
}) => {
  const { pathname } = useRouter();
  const { hasRole } = usePermissions();

  const cantAccessTab = (tab: TabType) => {
    return (
      tab.disabled ||
      (!!tab.restrictedToRoles?.length && !tab.restrictedToRoles.some((role) => hasRole(role)))
    );
  };

  return (
    <ApplicationLayout>
      <section
        aria-labelledby="primary-heading"
        className="flex flex-col w-full h-full overflow-auto"
      >
        <header className="sticky top-0 z-10 bg-navy-600">
          <div className="flex items-stretch justify-between px-12 bg-white border-b border-gray-100 rounded-tl-3xl">
            <h1 className="mt-8 text-left">{title}</h1>

            <nav className="flex mt-12 space-x-10 text-sm" data-testid="admin-menu-list">
              {Object.values(adminTabs).map((tab) => {
                if (cantAccessTab(tab)) {
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
                  <Link key={tab.href} href={tab.href}>
                    <a
                      className={classNames(MENU_ITEM_STYLE, {
                        [MENU_ITEM_ACTIVE_STYLE]: pathname === tab.href,
                      })}
                      data-testid="admin-menu-item"
                      data-testisactive={pathname === tab.href}
                      data-testname={`admin-menu-item-${tab.name}`}
                    >
                      {tab.name}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <section className="flex-1 p-6">{children}</section>
      </section>
    </ApplicationLayout>
  );
};

export default AdminLayout;
