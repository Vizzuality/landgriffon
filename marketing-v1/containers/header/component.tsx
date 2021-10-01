import React from 'react';

import Link from 'next/link';

import Button from 'components/button';

export const Header = () => (
  <header className="flex flex-col flex-grow w-full h-full row-auto pt-4 pb-5 mx-auto md:container">
    <nav className="relative flex flex-wrap items-center justify-between mt-1 md:mt-0 navbar-expand-lg">
      <Link href="/">
        <h1 className="text-base tracking-widest cursor-pointer md:text-lg font-heading">
          LANDGRIFFON
        </h1>
      </Link>
      <div className="flex items-center space-x-4 font-sans md:space-x-12">
        <Link href="/about-us">
          <div className="font-sans text-base cursor-pointer hover:font-sans-semibold">
            <p>About Us</p>
          </div>
        </Link>
        <Button
          theme="primary"
          size="l"
          className="flex-shrink-0 ml-5 w-36 h-11 md:w-44"
          onClick={() => console.info('Contact us')}
        >
          <a target="_blank" href="https://landgriffon.com" rel="noreferrer">
            Contact us
          </a>
        </Button>
      </div>
    </nav>
  </header>
);

export default Header;
