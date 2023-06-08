import { useEffect } from 'react';
import { CollectionIcon, ChartBarIcon } from '@heroicons/react/outline';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useTasks } from 'hooks/tasks';
import Navigation from 'containers/navigation/desktop';
import UserDropdown from 'containers/user-dropdown';
import LandgriffonLogo from 'containers/logo';
import ToastContainer from 'containers/toaster';

import type { NavigationList } from 'containers/navigation/types';
import type { Task } from 'types';

const navigationItems: NavigationList = [
  { name: 'Data', href: '/data', icon: CollectionIcon },
  { name: 'Analysis', href: '/analysis', icon: ChartBarIcon },
];

const ApplicationLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { data: tasks } = useTasks(
    {
      'page[size]': 1,
      'page[number]': 1,
      sort: '-createdAt',
    },
    {
      refetchInterval: 60000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  return (
    <div className="flex h-screen overflow-hidden min-h-[700px] min-w-screen-lg bg-navy-600">
      <div className="flex flex-col shrink-0 grow-0 w-28">
        <div className="flex justify-center py-12 shrink-0">
          <LandgriffonLogo />
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
