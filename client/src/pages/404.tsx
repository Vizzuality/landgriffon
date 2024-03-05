import React, { useCallback } from 'react';
import Router from 'next/router';
import Image from 'next/image';
import {
  CollectionIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/outline';

import NavigationError from 'containers/navigation/error';
import Logo from 'containers/logo';

import type { NavigationList } from 'containers/navigation/types';

const navigationItems: NavigationList = [
  { name: 'Analysis', href: '/analysis', icon: { default: CollectionIcon } },
  { name: 'Admin', href: '#', icon: { default: CogIcon } },
  { name: 'Help', href: '#', icon: { default: QuestionMarkCircleIcon } },
];

const Page404: React.FC = () => {
  const handleGoBack = useCallback(() => Router.back(), []);

  return (
    <div className="flex h-screen place-items-center justify-center">
      <div className="flex-col space-y-44">
        <Logo />

        <div>
          <h1 className="mb-2 text-5xl font-semibold text-gray-900">Page not found</h1>

          <p className="font-medium leading-5 text-gray-400">
            Sorry, we couldn&apos;t find Page you are looking for.
          </p>

          <button
            type="button"
            onClick={handleGoBack}
            className="mt-10 flex cursor-pointer text-green-700 hover:underline"
          >
            <ArrowLeftIcon className="mr-1 mt-1 h-4 w-4" />
            Go back
          </button>
        </div>

        <NavigationError items={navigationItems} />
      </div>

      <div className="ml-32">
        <Image src="/images/404.svg" width={700} height={264.24} alt="404 ERROR" />
      </div>
    </div>
  );
};

export default Page404;
