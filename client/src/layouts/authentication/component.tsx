import { Toaster } from 'react-hot-toast';
import LandgriffonLogo from 'containers/logo/component';
import React from 'react';

const AuthenticationLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex flex-col min-h-screen py-12 bg-primary sm:px-6 lg:px-8">
    <div className="text-center lg:text-left">
      <LandgriffonLogo />
    </div>
    <div className="flex flex-col justify-center flex-1 pt-12">{children}</div>
    <Toaster position="bottom-center" />
  </div>
);

export default AuthenticationLayout;
