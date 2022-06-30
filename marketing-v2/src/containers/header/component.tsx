import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import cx from 'classnames';

const Header: React.FC = () => {
  const { pathname } = useRouter();

  return (
    <header className="flex items-center justify-between font-semibold">
      <div className="px-12 shrink-0">
        <Link href="/">
          <a>
            <Image src="/images/logo.svg" alt="Landgriffon" width={180} height={14} priority />
          </a>
        </Link>
      </div>

      <nav>
        <ul className="flex space-x-14">
          <li>
            <Link href="/the-service">
              <a
                className={cx({
                  'relative block font-light py-7 hover:text-green-500': true,
                  'text-green-500': pathname === '/the-service',
                  'after:content-[""] after:absolute after:top-0 after:left-0 after:h-1 after:w-full after:bg-green-500':
                    pathname === '/the-service',
                })}
              >
                The service
              </a>
            </Link>
          </li>
          <li>
            <Link href="/methodology">
              <a
                className={cx({
                  'relative block font-light py-7 hover:text-green-500': true,
                  'text-green-500': pathname === '/methodology',
                  'after:content-[""] after:absolute after:top-0 after:left-0 after:h-1 after:w-full after:bg-green-500':
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
                  'relative block font-light py-7 hover:text-green-500': true,
                  'text-green-500': pathname === '/about',
                  'after:content-[""] after:absolute after:top-0 after:left-0 after:h-1 after:w-full after:bg-green-500':
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
                  'relative block font-light py-7 hover:text-green-500': true,
                  'text-green-500': pathname === '/faq',
                  'after:content-[""] after:absolute after:top-0 after:left-0 after:h-1 after:w-full after:bg-green-500':
                    pathname === '/faq',
                })}
              >
                FAQ
              </a>
            </Link>
          </li>
          <li>
            <Link href="/blog">
              <a
                className={cx({
                  'relative block font-light py-7 hover:text-green-500': true,
                  'text-green-500': pathname === '/blog',
                })}
              >
                Blog
              </a>
            </Link>
          </li>
        </ul>
      </nav>

      <div>
        <Link href="/contact">
          <a className="block px-10 text-white bg-green-500 py-7">Contact</a>
        </Link>
      </div>
    </header>
  );
};

export default Header;
