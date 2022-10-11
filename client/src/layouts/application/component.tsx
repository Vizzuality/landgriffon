import { CollectionIcon, ChartBarIcon } from '@heroicons/react/outline';

import Navigation from 'containers/navigation/desktop';
import UserDropdown from 'containers/user-dropdown';
import LandgriffonLogo from 'containers/logo';
import Alert from 'components/alert';

import type { NavigationList } from 'containers/navigation/types';

const navigationItems: NavigationList = [
  { name: 'Data', href: '/admin', icon: CollectionIcon },
  { name: 'Analysis', href: '/analysis', icon: ChartBarIcon },
];

const ApplicationLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex h-screen min-w-screen-lg bg-navy-600">
    <div className="flex flex-col flex-shrink-0 w-28">
      <div className="flex justify-center flex-shrink-0 py-12">
        <LandgriffonLogo />
      </div>
      <div className="flex-1">
        <Navigation items={navigationItems} />
      </div>
      <div className="flex flex-shrink-0 py-12 border-t border-t-black/30">
        <UserDropdown />
      </div>
    </div>
    <div className="flex-1 h-full bg-gray-100 rounded-tl-3xl">{children}</div>
    <Alert position="bottom-center" />
  </div>
);

export default ApplicationLayout;
