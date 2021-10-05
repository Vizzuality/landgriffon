import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import Wrapper from 'containers/wrapper';

export const HomeAbout = () => (
  <section className="relative flex flex-col flex-grow w-full h-full row-auto pt-4 mx-auto font-sans pb-72 md:container">
    <Wrapper>
      <div className="px-16">
        <h2 className="pb-12 text-5xl font-sans-semibold text-green">About us</h2>
        <div className="flex items-center justify-between pb-24 space-x-24">
          <h4 className="w-3/5 text-7xl">Supported by a team of experts </h4>
          <p className="w-2/5 text-xl">
            Our team brings expertise in environmental science, user-centric design, and satellite
            monitoring to help you reach a more sustainable future.
          </p>
        </div>
      </div>
      <div className="flex flex-col self-end w-4/5 px-32 py-16 space-y-16 bg-lightBlue">
        <p className="w-3/4 text-black text-7xl">
          Our future is a better future
        </p>
        <div className="grid grid-cols-2" >
          <div />
          <div className="px-10">
            <p className="text-3xl">LandGriffon is built by:</p>
            <ul className="flex flex-col py-16 space-y-12 text-5xl font-sans-semibold">
              <li>
                Vizzuality
              </li>
              <li>
                Satelligence
              </li>
              <li>
                SEI
              </li>
            </ul>
            <Link href="https://landgriffon.com">
              <a
                className="text-5xl text-black underline font-sans-semibold hover:no-underline"
                target="_blank"
                href="https://landgriffon.com"
                rel="noreferrer"
              >
                Learn more
              </a>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-24 left-28">
        <Image width="710px" height="661px" src="/images/home/home-4.jpg" />
      </div>
    </Wrapper>
  </section>
);

export default HomeAbout;
