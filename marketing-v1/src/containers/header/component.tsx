/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';

import cx from 'classnames';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { motion, AnimatePresence } from 'framer-motion';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

import LinkButton from 'components/button';

import MenuButton from '../../components/menu-button';

const Header: React.FC = () => {
  const router = useRouter();
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  return (
    <header>
      <Media lessThan="md">
        <div className="top-0 p-4 fixed bg-white w-full z-10 bg-opacity-90">
          <nav className="flex items-center justify-between w-full">
            <Link href="/">
              <a className="text-lg tracking-widest font-semibold font-heading">LANDGRIFFON</a>
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
        </div>
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
                  <a className="text-lg tracking-widest cursor-pointer font-heading font-semibold">
                    LANDGRIFFON
                  </a>
                </Link>
                <div className="flex items-center w-1/5 h-10 space-between">
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
              <Link href="/services/measure">
                <a onClick={() => setMenuIsOpen(false)}>
                  <motion.div
                    className={cx({
                      'font-semibold text-base cursor-pointer opacity-60 hover:opacity-100': true,
                      'opacity-100': router.asPath === '/measure',
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
                <LinkButton
                  href="/contact"
                  rel="noreferrer"
                  theme="primary"
                  size="l"
                  className="flex-shrink-0 w-44 h-11"
                >
                  Contact us
                </LinkButton>
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
                <Link href="/services/measure">
                  <a
                    className={cx({
                      'font-semibold text-base opacity-60 hover:opacity-100': true,
                      'opacity-100': router.asPath === '/measure',
                    })}
                  >
                    <p>Services</p>
                  </a>
                </Link>
                <Link href="/about-us">
                  <a
                    className={cx({
                      'font-semibold text-base opacity-60 hover:opacity-100': true,
                      'opacity-100': router.asPath === '/about-us',
                    })}
                  >
                    <p>About Us</p>
                  </a>
                </Link>
                <LinkButton
                  href="/contact"
                  rel="noreferrer"
                  theme="primary"
                  size="l"
                  className="flex-shrink-0 ml-5 transition duration-500 ease-in-out h-11 w-44"
                >
                  Contact us
                </LinkButton>
              </div>
            </nav>
          </Wrapper>
        </header>
      </Media>
    </header>
  );
};

export default Header;
