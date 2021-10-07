import React, { useState } from 'react';

import Link from 'next/link';

import { Media } from 'containers/media';

import Button from 'components/button';

import MenuButton from './menu-button';

const Header: React.FC = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const canvasStyle = {
    display: 'flex',
    width: '20vw',
    height: '6vh',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const menuButtonStyle = {
    marginLeft: '2rem',
  };

  return (
    <>
      <Media lessThan="md">
        <header className="pt-4 pb-5 px-3.5 relative">
          <nav className="flex items-center justify-between w-full">
            <Link href="/">
              <h1 className="text-lg tracking-widest cursor-pointer font-heading">LANDGRIFFON</h1>
            </Link>

            <div style={canvasStyle}>
              <MenuButton
                isOpen={menuIsOpen}
                onClick={() => setMenuIsOpen(true)}
                strokeWidth="3"
                color="#000000"
                transition={{ ease: 'easeOut', duration: 0.2 }}
                width={35}
                height={25}
                style={menuButtonStyle}
              />
            </div>
          </nav>
        </header>

        {menuIsOpen && (
          <nav className="shadow absolute top-0 z-10 flex flex-col items-center w-full px-3.5 pt-4 pb-8 space-y-10 bg-white">
            <div className="flex items-center justify-between w-full">
              <Link href="/">
                <h1 className="text-lg tracking-widest cursor-pointer font-heading">LANDGRIFFON</h1>
              </Link>
              <div style={canvasStyle}>
                <MenuButton
                  isOpen={menuIsOpen}
                  onClick={() => setMenuIsOpen(false)}
                  strokeWidth="4"
                  color="#000000"
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                  width={40}
                  height={30}
                  style={menuButtonStyle}
                />
              </div>
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
        )}
      </Media>

      <Media greaterThanOrEqual="md">
        <header className="container flex flex-col justify-between flex-grow w-full h-full row-auto pt-4 pb-5 mx-auto md:px-12 xl:px-0">
          <nav className="relative flex flex-wrap items-center justify-between mt-1 navbar-expand-lg">
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
