import { CollectionIcon as CollectionIconOutline } from '@heroicons/react/outline';
import { CollectionIcon as CollectionIconSolid } from '@heroicons/react/solid';

// The'ChartBarIcon' fom the modules @heroicons/react are different from the website (and design)
import { ChartBarIconOutline, ChartBarIconSolid } from './icons/chart-bar';

import { useLasTask } from 'hooks/tasks';
import Navigation from 'containers/navigation/desktop';
import UserDropdown from 'containers/user-dropdown';
import LandgriffonLogo from 'containers/logo';
import ToastContainer from 'containers/toaster';

import type { NavigationList } from 'containers/navigation/types';

const ApplicationLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { data: lastTask } = useLasTask();
  const navigationItems: NavigationList = [
    {
      name: 'Data',
      href: '/data',
      icon: {
        default: CollectionIconOutline,
        active: CollectionIconSolid,
      },
    },
    {
      name: 'Analysis',
      href: '/analysis',
      icon: { default: ChartBarIconOutline, active: ChartBarIconSolid },
      disabled: !!(!lastTask || lastTask?.status === 'processing'),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden min-h-[700px] min-w-screen-lg bg-navy-600">
      <div className="flex flex-col shrink-0 grow-0 w-28">
        <div className="flex justify-center py-12 shrink-0">
          <LandgriffonLogo className="shadow-menu rounded-lg" />
        </div>
        <div className="grow">
          <Navigation items={navigationItems} />
        </div>
        <div className="flex py-12 border-t shrink-0 border-t-black/30">
          <UserDropdown />
        </div>
      </div>
      <div className="flex-1 w-full min-w-0 bg-gray-100 rounded-tl-3xl">{children}</div>
      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default ApplicationLayout;
