import Image from 'next/image';
import React from 'react';

import ToastContainer from 'containers/toaster';

const AuthenticationLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-auth py-12 sm:px-6 lg:px-8">
    <div className="mx-auto">
      <Image src="/landgriffon-logo-white.svg" width={196} height={17} alt="Landgriffon logo" />
    </div>
    <div className="flex flex-1 flex-col justify-center pt-12">{children}</div>
    <ToastContainer position="bottom-center" />
  </div>
);

export default AuthenticationLayout;
