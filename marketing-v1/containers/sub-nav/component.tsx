import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import ARROW_LEFT_SVG from 'svgs/arrow-left.svg';
import ARROW_RIGHT_SVG from 'svgs/arrow-right.svg';

import {
  NAVIGATION_LEFT,
  NAVIGATION_LEFT_HREF,
  NAVIGATION_RIGHT,
  NAVIGATION_RIGHT_HREF,
} from './constants';

export interface SubNavProps {
  type: string;
}

export const SubNav: React.FC<SubNavProps> = ({ type }: SubNavProps) => (
  <section className="flex flex-col flex-grow w-full h-full py-12 mx-auto font-sans bg-white md:container">
    <div className="flex justify-between text-4xl font-semibold">
      <Link href={NAVIGATION_LEFT_HREF[type]}>
        <a className="flex items-center" href={NAVIGATION_LEFT_HREF[type]}>
          <Image height="50px" width="100px" src={ARROW_LEFT_SVG} />
          <p className="ml-12">{NAVIGATION_LEFT[type]}</p>
        </a>
      </Link>
      <Link href={NAVIGATION_RIGHT_HREF[type]}>
        <a className="flex items-center" href={NAVIGATION_RIGHT_HREF[type]}>
          <p className="mr-12">{NAVIGATION_RIGHT[type]}</p>
          <Image height="50px" width="100px" src={ARROW_RIGHT_SVG} />
        </a>
      </Link>
    </div>
  </section>
);

export default SubNav;
