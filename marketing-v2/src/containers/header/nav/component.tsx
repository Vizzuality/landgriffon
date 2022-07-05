import Link from 'next/link';
import { useRouter } from 'next/router';

import cx from 'classnames';
import { useMediaMatch } from 'rooks';
import { motion, AnimatePresence } from 'framer-motion';

import lockScroll from 'react-lock-scroll';

export interface NavProps {
  open: boolean;
}

const HeaderNav: React.FC<NavProps> = ({ open }: NavProps) => {
  const { pathname } = useRouter();

  const isLg = useMediaMatch('(min-width: 1024px)');

  lockScroll(!isLg && open);

  return (
    <AnimatePresence>
      {(open || isLg) && (
        <motion.nav
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: isLg ? 0 : 0.25,
            },
          }}
          exit={{
            opacity: 0,
            y: -10,
          }}
          className="flex flex-col justify-between lg:flex-row lg:space-x-10 fixed left-0 z-50 w-full h-[calc(100%_-_theme(space.14))] lg:h-auto bg-white top-14 lg:top-0 lg:w-auto lg:relative py-5 lg:py-0"
        >
          <ul className="flex flex-col space-y-5 lg:flex-row lg:space-y-0 lg:space-x-14">
            {!isLg && (
              <li>
                <Link href="/">
                  <a
                    className={cx({
                      'relative block font-light text-2xl lg:text-base py-1 lg:py-7 mx-5 lg:mx-0 px-5 lg:px-0 hover:text-green-500':
                        true,
                      'text-green-500': pathname === '/',
                      'after:content-[""] after:absolute after:top-0 after:left-0 after:h-full after:w-2 lg:after:h-1 lg:after:w-full after:bg-green-500':
                        pathname === '/',
                    })}
                  >
                    Home
                  </a>
                </Link>
              </li>
            )}
            <li>
              <Link href="/the-service">
                <a
                  className={cx({
                    'relative block font-light text-2xl lg:text-base py-1 lg:py-7 mx-5 lg:mx-0 px-5 lg:px-0 hover:text-green-500':
                      true,
                    'text-green-500': pathname === '/the-service',
                    'after:content-[""] after:absolute after:top-0 after:left-0 after:h-full after:w-2 lg:after:h-1 lg:after:w-full after:bg-green-500':
                      pathname === '/the-service',
                  })}
                >
                  The Service
                </a>
              </Link>
            </li>
            <li>
              <Link href="/methodology">
                <a
                  className={cx({
                    'relative block font-light text-2xl lg:text-base py-1 lg:py-7 mx-5 lg:mx-0 px-5 lg:px-0 hover:text-green-500':
                      true,
                    'text-green-500': pathname === '/methodology',
                    'after:content-[""] after:absolute after:top-0 after:left-0 after:h-full after:w-2 lg:after:h-1 lg:after:w-full after:bg-green-500':
                      pathname === '/methodology',
                  })}
                >
                  Methodology
                </a>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <a
                  className={cx({
                    'relative block font-light text-2xl lg:text-base py-1 lg:py-7 mx-5 lg:mx-0 px-5 lg:px-0 hover:text-green-500':
                      true,
                    'text-green-500': pathname === '/about',
                    'after:content-[""] after:absolute after:top-0 after:left-0 after:h-full after:w-2 lg:after:h-1 lg:after:w-full after:bg-green-500':
                      pathname === '/about',
                  })}
                >
                  About
                </a>
              </Link>
            </li>
            <li>
              <Link href="/faq">
                <a
                  className={cx({
                    'relative block font-light text-2xl lg:text-base py-1 lg:py-7 mx-5 lg:mx-0 px-5 lg:px-0 hover:text-green-500':
                      true,
                    'text-green-500': pathname === '/faq',
                    'after:content-[""] after:absolute after:top-0 after:left-0 after:h-full after:w-2 lg:after:h-1 lg:after:w-full after:bg-green-500':
                      pathname === '/faq',
                  })}
                >
                  FAQ
                </a>
              </Link>
            </li>
            <li>
              <a
                href="https://medium.com/vizzuality-blog/tagged/sustainable-supply-chain"
                target="_blank"
                rel="noopener noreferrer"
                className={cx({
                  'relative block font-light text-2xl lg:text-base py-1 lg:py-7 mx-5 lg:mx-0 px-5 lg:px-0 hover:text-green-500':
                    true,
                })}
              >
                Blog
              </a>
            </li>
          </ul>
          <div>
            <Link href="/contact">
              <a className="block px-10 mx-5 text-base text-center text-white bg-green-500 lg:mx-0 py-7">
                Contact
              </a>
            </Link>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default HeaderNav;
