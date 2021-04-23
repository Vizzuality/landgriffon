import React from 'react';
import Link from 'next/link';
import Logo from 'components/logo';

const StaticPage: React.FC = ({ children }) => (
  <div>
    <header className="px-10 py-7 lg:p-10 flex justify-center items-start xl:justify-start lg:w-1/5">
      <Link href="/">
        <a>
          <Logo />
        </a>
      </Link>
    </header>
    <div className="flex justify-center">
      <div className="max-w-screen-lg prose lg:prose-x my-8 mx-4">
        {children}
      </div>
    </div>
  </div>
);

export default StaticPage;
