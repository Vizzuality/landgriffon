import React from 'react';
import { useRouter } from 'next/router';
import type { NavigationList } from 'containers/navigation/types';
import NavigationError from 'containers/navigation/error';
import Logo from 'containers/logo';
import Image from 'next/image';
import { QuestionMarkCircleIcon } from '@heroicons/react/outline';
import { Button } from 'components/button';

const navigationItems: NavigationList = [{ name: 'Help', href: '#', icon: QuestionMarkCircleIcon }];

const Page500: React.FC = () => {
  const route = useRouter();
  const handleReload = () => route.reload();

  return (
    <div className="flex justify-center h-screen place-items-center">
      <div className="flex-col max-w-md space-y-44">
        <Logo />

        <div>
          <h1 className="mb-2 text-5xl font-semibold text-gray-900">Server error</h1>

          <p className="text-lg font-normal leading-5 text-gray-400 ">
            Something went wrong. Please try to reload the page. If the problem persists, feel free
            to contact us
          </p>

          <Button variant="primary" onClick={handleReload} className="mt-12">
            Reload
          </Button>
        </div>

        <div className="w-20">
          <NavigationError items={navigationItems} />
        </div>
      </div>

      <div className="ml-32">
        <Image src="/images/500.svg" width="700" height="264.24" alt="500 ERROR" />
      </div>
    </div>
  );
};

export default Page500;
