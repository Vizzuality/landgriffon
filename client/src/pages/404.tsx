import React from 'react';
import Router from 'next/router';
import { NavigationList } from 'containers/navigation/types';

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
  return (
    <div className="flex justify-center h-screen place-items-center gap-x-4">
      <div className="flex-col space-y-40">
        <h2 className="font-bold text-green-700 uppercase">landgriffon</h2>

        <div>
          <h1 className="text-3xl font-bold">Page not found</h1>

          <p className="text-gray-400">Sorry, we couldn't find Page you are looking for.</p>

          <a onClick={() => Router.back()} className="flex mt-6 text-green-700 cursor-pointer">
            <ArrowLeftIcon className="w-4 h-4 mt-1 mr-1" />
            Go back
          </a>
        </div>

        <div className="flex bg-white bottom-7">
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex flex-col items-center w-full p-3 text-xs font-medium text-green-800 rounded-md"
            >
              <item.icon className="w-6 h-6" aria-hidden="true" />
              <span className="mt-2">{item.name}</span>
            </a>
          ))}
        </div>
      </div>

      <span className="absolute font-bold text-9xl text-gray-200 -mt-64 sm:m-0 sm:text-[25vw] sm:relative">
        404
      </span>
    </div>
  );
};

export default Page404;
