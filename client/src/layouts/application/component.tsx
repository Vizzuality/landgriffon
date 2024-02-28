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

  if (process.env.NEXT_PUBLIC_MODULE_EUDR === 'true') {
    navigationItems.push({
      name: 'EUDR',
      href: '/eudr',
      icon: { default: ChartBarIconOutline, active: ChartBarIconSolid },
      disabled: !!(!lastTask || lastTask?.status === 'processing'),
    });
  }

  return (
    <div className="min-w-screen-lg flex h-screen min-h-[700px] overflow-hidden bg-navy-600">
      <div className="flex w-28 shrink-0 grow-0 flex-col">
        <div className="flex shrink-0 justify-center py-12">
          <LandgriffonLogo className="rounded-lg shadow-menu" />
        </div>
        <div className="grow">
          <Navigation items={navigationItems} />
        </div>
        <div className="flex shrink-0 border-t border-t-black/30 py-12">
          <UserDropdown />
        </div>
      </div>
      <div className="w-full min-w-0 flex-1 rounded-tl-3xl bg-gray-100">{children}</div>
      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default ApplicationLayout;
