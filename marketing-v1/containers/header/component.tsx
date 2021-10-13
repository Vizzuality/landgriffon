import React, { useState } from 'react';

import cx from 'classnames';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { motion, AnimatePresence } from 'framer-motion';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

import Button from 'components/button';

import MenuButton from '../../components/menu-button';

const Header: React.FC = () => {
  const router = useRouter();
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  return (
    <div>
      <Media lessThan="md">
        <header className="top-0 p-4 fixed bg-white w-full z-10 bg-opacity-90">
          <nav className="flex items-center justify-between w-full">
            <Link href="/">
              <h1 className="text-lg tracking-widest cursor-pointer font-heading">LANDGRIFFON</h1>
            </Link>

            <div className="flex items-center w-1/5 h-10 space-between">
              <MenuButton
                isOpen={menuIsOpen}
                onClick={() => setMenuIsOpen(true)}
                strokeWidth="3"
                color="#000000"
                transition={{ ease: 'easeOut', duration: 0.2 }}
                width={35}
                height={25}
                className="ml-8"
              />
            </div>
          </nav>
        </header>
        <AnimatePresence>
          {menuIsOpen && (
            <motion.nav
              className="fixed top-0 z-10 flex flex-col items-center w-full p-4 space-y-10 bg-white"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 0.97 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between w-full bg-white">
                <Link href="/">
                  <h1 className="text-lg tracking-widest cursor-pointer font-heading">
                    LANDGRIFFON
                  </h1>
                </Link>
                <div className="flex items-center w-1/5 h-10 space-between mr-3.5 xs:mr-0">
                  <MenuButton
                    isOpen={menuIsOpen}
                    onClick={() => setMenuIsOpen(false)}
                    strokeWidth="4"
                    color="#000000"
                    transition={{ ease: 'easeOut', duration: 0.2 }}
                    width={35}
                    height={25}
                    className="ml-8"
                  />
                </div>
              </div>
              <Link href="/measure">
                <a href="/measure" onClick={() => setMenuIsOpen(false)}>
                  <motion.div
                    className={cx({
                      'font-semibold text-base cursor-pointer opacity-60 hover:opacity-100': true,
                      'opacity-100': router.asPath === '/#services',
                    })}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span>Services</span>
                  </motion.div>
                </a>
              </Link>
              <Link href="/about-us">
                <motion.div
                  className={cx({
                    'font-semibold text-base cursor-pointer opacity-60 hover:opacity-100': true,
                    'opacity-100': router.asPath === '/about-us',
                  })}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <span>About Us</span>
                </motion.div>
              </Link>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Button theme="primary" size="l" className="flex-shrink-0 w-44 h-11">
                  <a href="/contact" rel="noreferrer">
                    Contact us
                  </a>
                </Button>
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>
      </Media>

      <Media greaterThanOrEqual="md">
        <header className="fixed top-0 z-10 w-full py-4 bg-white">
          <Wrapper hasPadding={false}>
            <nav className="flex flex-wrap items-center justify-between w-full navbar-expand-lg">
              <Link href="/">
                <h1 className="text-lg tracking-widest cursor-pointer font-heading">LANDGRIFFON</h1>
              </Link>
              <div className="flex items-center space-x-12 font-sans">
                <Link href="/#services">
                  <a
                    href="/#services"
                    className={cx({
                      'font-semibold text-base opacity-60 hover:opacity-100': true,
                      'opacity-100': router.asPath === '/#services',
                    })}
                  >
                    <p>Services</p>
                  </a>
                </Link>
                <Link href="/about-us">
                  <a
                    href="/about-us"
                    className={cx({
                      'font-semibold text-base opacity-60 hover:opacity-100': true,
                      'opacity-100': router.asPath === '/about-us',
                    })}
                  >
                    <p>About Us</p>
                  </a>
                </Link>
                <Button
                  theme="primary"
                  size="l"
                  className="flex-shrink-0 ml-5 transition duration-500 ease-in-out h-11 w-44"
                >
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
