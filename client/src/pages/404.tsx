import React, { useCallback } from 'react';
import Router from 'next/router';
import { NavigationList } from 'containers/navigation/types';
import NavigationError from 'containers/navigation/error';
import Logo from 'containers/logo';

import {
  CollectionIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  ArrowLeftIcon,
  HomeIcon,
} from '@heroicons/react/outline';

const navigationItems: NavigationList = [
  { name: 'Overview', href: '/', icon: HomeIcon },
  { name: 'Analysis', href: '/analysis', icon: CollectionIcon },
  { name: 'Admin', href: '#', icon: CogIcon },
  { name: 'Help', href: '#', icon: QuestionMarkCircleIcon },
];

const Page404: React.FC = () => {
  const handleGoBack = useCallback(() => Router.back(), []);

  return (
    <div className="flex justify-center h-screen place-items-center gap-x-4">
      <div className="flex-col space-y-40">
        <Logo />

        <div>
          <h1 className="text-5xl font-semibold text-gray-900 mb-2">Page not found</h1>

          <p className="text-gray-400 font-medium leading-5">
            Sorry, we couldn&apos;t find Page you are looking for.
          </p>

          <button
            type="button"
            onClick={handleGoBack}
            className="flex mt-10 text-green-700 cursor-pointer hover:underline"
          >
            <ArrowLeftIcon className="w-4 h-4 mt-1 mr-1" />
            Go back
          </button>
        </div>

        <NavigationError navigationItems={navigationItems} />
      </div>

      <span className="absolute font-bold text-9xl text-gray-200 -mt-64 sm:m-0 sm:text-[25vw] sm:relative">
        404
      </span>
    </div>
  );
};

export default Page404;
