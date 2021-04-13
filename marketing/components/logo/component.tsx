import React from 'react';
import Image from 'next/image';

const Logo: React.FC = () => (
  <Image
    alt="Landgriffon Logo"
    className="w-40 md:w-auto"
    height="23"
    src="/landgriffon-logo.svg"
    width="273"
  />
);

export default Logo;
