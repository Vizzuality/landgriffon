import React from 'react';

import cx from 'classnames';

import Link from 'next/link';

import Wrapper from 'containers/wrapper';

export const Header = () => (
  <header
    className={cx({
      'w-full row-auto': true,
    })}
  >
    <Wrapper>
      <nav className="relative flex flex-wrap items-center justify-between mt-10 md:mt-0 navbar-expand-lg">
        <Link href="/">LANDGRIFFON</Link>
        <Link href="/about-us">About Us</Link>
      </nav>
    </Wrapper>
  </header>
);

export default Header;
