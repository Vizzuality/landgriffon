import Image from 'next/image';
import React from 'react';

import ToastContainer from 'containers/toaster';

const AuthenticationLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex flex-col min-h-screen py-12 bg-auth sm:px-6 lg:px-8">
    <div className="text-center">
      <Image src="/landgriffon-logo-white.svg" width={196} height={16} alt="Landgriffon logo" />
    </div>
    <div className="flex flex-col justify-center flex-1 pt-12">{children}</div>
    <ToastContainer position="bottom-center" />
  </div>
);

export default AuthenticationLayout;
