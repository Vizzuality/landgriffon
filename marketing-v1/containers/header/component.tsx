import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { motion } from 'framer-motion';

import { Media } from 'containers/media';

import Button from 'components/button';

import CLOSE_SVG from 'svgs/close.svg';
import MENU_SVG from 'svgs/menu.svg';

const Header: React.FC = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  return (
    <>
      <Media lessThan="md">
        <header className="pt-4 pb-5 px-3.5 relative">
          <nav className="flex items-center justify-between w-full">
            <Link href="/">
              <h1 className="text-base tracking-widest cursor-pointer font-heading">LANDGRIFFON</h1>
            </Link>
            <button className="cursor" type="button" onClick={() => setMenuIsOpen(true)}>
              <Image height="30px" width="26px" src={MENU_SVG} />
            </button>
          </nav>
        </header>
        {menuIsOpen && (
          <motion.div
            layout
            initial={{ height: 0 }}
            animate={{ opacity: 1 }}
            exit={{ height: '100%' }}
          >
            <nav className="absolute top-0 z-10 flex flex-col items-center w-full px-3.5 py-4 space-y-10 bg-white">
              <div className="flex items-center justify-between w-full">
                <Link href="/">
                  <h1 className="text-base tracking-widest cursor-pointer font-heading">
                    LANDGRIFFON
                  </h1>
                </Link>
                <button className="cursor" type="button" onClick={() => setMenuIsOpen(false)}>
                  <Image height="30px" width="26px" src={CLOSE_SVG} />
                </button>
              </div>
              <Link href="/">
                <div className="font-sans text-base cursor-pointer hover:font-sans-semibold">
                  <p>Services</p>
                </div>
              </Link>
              <Link href="/about-us">
                <div className="font-sans text-base cursor-pointer hover:font-sans-semibold">
                  <p>About Us</p>
                </div>
              </Link>
              <Button theme="primary" size="l" className="flex-shrink-0 w-44 h-11">
                <a href="/contact" rel="noreferrer">
                  Contact us
                </a>
              </Button>
            </nav>
          </motion.div>
        )}
      </Media>

      <Media greaterThanOrEqual="md">
        <header className="container flex flex-col justify-between flex-grow w-full h-full row-auto pt-4 pb-5 mx-auto">
          <nav className="relative flex flex-wrap items-center justify-between mt-0 mt-1 navbar-expand-lg">
            <Link href="/">
              <h1 className="text-lg tracking-widest cursor-pointer font-heading">LANDGRIFFON</h1>
            </Link>
            <div className="flex items-center space-x-12 font-sans">
              <Link href="/about-us">
                <div className="font-sans text-base cursor-pointer hover:font-sans-semibold">
                  <p>About Us</p>
                </div>
              </Link>
              <Button theme="primary" size="l" className="flex-shrink-0 ml-5 h-11 w-44">
                <a href="/contact" rel="noreferrer">
                  Contact us
                </a>
              </Button>
            </div>
          </nav>
        </header>
      </Media>
    </>
  );
};

export default Header;
