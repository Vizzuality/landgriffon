import React from 'react';
import { useRouter } from 'next/router';

const Logo: React.FC = () => {
  const { basePath } = useRouter();
  return (
    <img
      alt="Landgriffon Logo"
      className="w-40 h-auto md:w-auto md:h-auto"
      height="23px"
      src={`${basePath}/landgriffon-logo.svg`}
      width="273px"
    />
  );
};

export default Logo;
