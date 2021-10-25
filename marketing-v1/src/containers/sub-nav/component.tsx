import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Media } from 'containers/media';

import ARROW_LEFT_SVG from 'svgs/arrow-left.svg';
import ARROW_RIGHT_SVG from 'svgs/arrow-right.svg';

import {
  NAVIGATION_LEFT,
  NAVIGATION_LEFT_HREF,
  NAVIGATION_RIGHT,
  NAVIGATION_RIGHT_HREF,
  NAVIGATION_MOBILE_LEFT,
  NAVIGATION_MOBILE_RIGHT,
} from './constants';

export interface SubNavProps {
  type: string;
}

const SubNav: React.FC<SubNavProps> = ({ type }: SubNavProps) => (
  <>
    <Media lessThan="lg">
      <section className="flex justify-between flex-grow w-full h-full py-20 px-3.5 mx-auto text-xl md:text-4xl md:px-12 bg-white font-sans font-semibold">
        <Link href={NAVIGATION_LEFT_HREF[type]}>
          <a className="flex items-center" href={NAVIGATION_LEFT_HREF[type]}>
            <Image height="32px" width="62px" src={ARROW_LEFT_SVG} />
            <p className="ml-3">{NAVIGATION_MOBILE_LEFT[type]}</p>
          </a>
        </Link>
        <Link href={NAVIGATION_RIGHT_HREF[type]}>
          <a className="flex items-center" href={NAVIGATION_RIGHT_HREF[type]}>
            <p className="mr-3">{NAVIGATION_MOBILE_RIGHT[type]}</p>
            <Image height="32px" width="62px" src={ARROW_RIGHT_SVG} />
          </a>
        </Link>
      </section>
    </Media>

    <Media greaterThanOrEqual="lg">
      <section className="container flex justify-between flex-grow w-full h-full py-12 mx-auto text-4xl bg-white xl:px-0 lg:px-12 font-semibold">
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
      </section>
    </Media>
  </>
);

export default SubNav;
