import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Media } from 'containers/media';

import Button from 'components/button';

import MENU_SVG from 'svgs/menu.svg';

export const Header = () => (
  <header className="flex justify-between flex-grow w-full h-full row-auto pt-4 pb-5 px-3.5 md:px-0 mx-auto md:flex-col md:container">
    <nav className="relative flex items-center mt-1 md:flex-wrap md:justify-between md:mt-0 navbar-expand-lg">
      <Link href="/">
        <h1 className="text-base tracking-widest cursor-pointer md:text-lg font-heading">
          LANDGRIFFON
        </h1>
      </Link>
      <Media greaterThanOrEqual="md">
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
            <a target="_blank" href="/contact" rel="noreferrer">
              Contact us
            </a>
          </Button>
        </div>
      </Media>
    </nav>
    <Media lessThan="md">
      <button type="button" onClick={() => console.info('Open menu')}>
        <Image height="30px" width="26px" src={MENU_SVG} />
      </button>
    </Media>
  </header>
);

export default Header;
