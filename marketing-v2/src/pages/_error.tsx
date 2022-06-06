import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Button } from 'components/button';

const Page500: React.FC = () => {
  const route = useRouter();
  const handleReload = () => route.reload();

  return (
    <div className="flex justify-center h-screen place-items-center">
      <div className="flex-col max-w-md space-y-44">
        <div>
          <h1 className="mb-2 text-5xl font-semibold text-gray-900">Server error</h1>

          <p className="text-lg font-normal leading-5 text-gray-400 ">
            Something went wrong. Please try to reload the page. If the problem persists, feel free
            to contact us
          </p>

          <Button theme="primary" onClick={handleReload} className="mt-12">
            Reload
          </Button>
        </div>

        <div className="w-20"></div>
      </div>

      <div className="ml-32">
        <Image src="/images/500.svg" width="700" height="264.24" alt="500 ERROR" />
      </div>
    </div>
  );
};

export default Page500;
