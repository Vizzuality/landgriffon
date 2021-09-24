import React from 'react';

import Link from 'next/link';

import Button from 'components/button';

export const Header = () => (
  <header className="w-full row-auto pt-4 pb-5">
    <nav className="relative flex flex-wrap items-center justify-between mt-1 md:mt-0 navbar-expand-lg">
      <Link href="/">
        <h1 className="text-lg tracking-widest font-heading">LANDGRIFFON</h1>
      </Link>
      <div className="flex items-center space-x-12 font-sans">
        <Link href="/about-us">
          <div className="font-sans text-base cursor-pointer">
            <p>About Us</p>
          </div>
        </Link>
        <Button
          theme="primary"
          size="l"
          className="flex-shrink-0 ml-5 h-11 w-44"
          onClick={() => console.info('Contact us')}
        >
          Contact us
        </Button>
      </div>
    </nav>
  </header>
);

export default Header;
