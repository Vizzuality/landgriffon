import React, { useState } from 'react';

import Link from 'next/link';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

import Button from 'components/button';

import MenuButton from '../../components/menu-button';

export interface HeaderProps {
  onServicesClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onServicesClick }: HeaderProps) => {
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

  const handleServicesClick = () => {
    onServicesClick();
    setMenuIsOpen(false);
  };

  return (
    <div className="bg-white h-18 md:h-16">
      <Media lessThan="md">
        <header className="pt-4 pb-4 px-3.5 fixed bg-white w-full z-10 opacity-90">
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
          <nav className="shadow fixed top-0 z-10 flex flex-col items-center w-full px-3.5 pt-4 pb-8 space-y-10 bg-white">
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
            <button type="button" onClick={handleServicesClick}>
              <div className="font-sans text-base cursor-pointer hover:font-sans-semibold">
                <p>Services</p>
              </div>
            </button>
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
        <header className="fixed z-10 flex flex-col justify-between w-full pt-4 pb-5 bg-white md:flex-row md:px-12 xl:px-0">
          <Wrapper>
            <nav className="flex flex-wrap items-center justify-between w-full mt-1 navbar-expand-lg">
              <Link href="/">
                <h1 className="text-lg tracking-widest cursor-pointer font-heading">LANDGRIFFON</h1>
              </Link>
              <div className="flex items-center space-x-12 font-sans">
                <button type="button" onClick={onServicesClick}>
                  <div className="font-sans text-base cursor-pointer hover:font-sans-semibold">
                    <p>Services</p>
                  </div>
                </button>
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
          </Wrapper>
        </header>
      </Media>
    </div>
  );
};

export default Header;
