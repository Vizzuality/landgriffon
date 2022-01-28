import React from 'react';
import type { NavigationList } from 'containers/navigation/types';
import {
  CollectionIcon,
  CogIcon,
  ChartSquareBarIcon,
  QuestionMarkCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/outline';
import DesktopNavigation from 'containers/navigation/page';

const navigationItems: NavigationList = [
  { name: 'Overview', href: '/', icon: ChartSquareBarIcon },
  { name: 'Analysis', href: '/analysis', icon: CollectionIcon },
  { name: 'Admin', href: '#', icon: CogIcon },
  { name: 'Help', href: '#', icon: QuestionMarkCircleIcon },
];

const notFound: React.FC = () => {
  return (
    <div className="flex justify-center mt-32 gap-14">
      <div className="relative w-96">
        <h2 className="absolute text-green-700 uppercase top-6">landgriffon</h2>

        <div className="absolute top-56 ">
          <h1 className="text-3xl font-bold">Page not found</h1>
          <p className="text-gray-400">Sorry, we couldn't find Page you are looking for.</p>
          <p className="flex mt-6 text-green-700">
            <ArrowLeftIcon className="w-4 h-4 mt-1 mr-1" />
            Go back
          </p>
        </div>

        <div className="absolute bg-white bottom-7">
          <DesktopNavigation items={navigationItems} />
        </div>
      </div>

      <div className="text-gray-200" style={{ fontSize: '20vw' }}>
        404
      </div>
    </div>
  );
};

export default notFound;
