import React from 'react';
import Image from 'next/image';

const Logo: React.FC = () => (
  <Image src="/landgriffon-logo.svg" alt="Landgriffon Logo" className="w-40 md:w-auto" width="273" height="23" />
);

export default Logo;
