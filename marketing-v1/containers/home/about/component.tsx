import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

const HomeAbout: React.FC = () => (
  <section className="flex flex-col flex-grow w-full h-full row-auto pt-4 mx-auto font-sans pb-26 md:pb-72 md:container">
    <Wrapper>
      <div className="md:px-16">
        <h2 className="pb-12 text-xl md:text-5xl font-sans-semibold text-green">About us</h2>
        <div className="flex flex-col items-center justify-between pb-24 space-y-4 md:space-x-24 lg:flex-row">
          <h4 className="text-5xl font-semibold md:w-3/5 md:font-normal md:text-7xl">
            Supported by a team of experts
          </h4>
          <p className="text-base md:text-xl md:w-2/5">
            Our team brings expertise in environmental science, user-centric design, and satellite
            monitoring to help you reach a more sustainable future.
          </p>
        </div>
      </div>
      <div className="relative flex flex-col px-4 py-8 md:py-16 md:w-4/5 md:px-32 md:self-end bg-lightBlue">
        <p className="w-3/4 text-5xl font-semibold text-black pb-96 md:pb-16 md:text-7xl md:font-normal">
          Our future is a better future
        </p>
        <div className="md:grid md:grid-cols-2">
          <div className="invisible md:visible" />
          <div className="md:px-10">
            <p className="text-base md:text-3xl">LandGriffon is built by:</p>
            <ul className="flex flex-col py-6 space-y-6 text-lg md:py-16 md:space-y-12 md:text-5xl font-sans-semibold">
              <li>Vizzuality</li>
              <li>Satelligence</li>
              <li>SEI</li>
            </ul>
            <Link href="https://landgriffon.com">
              <a
                className="text-lg text-black underline md:text-5xl font-sans-semibold hover:no-underline"
                target="_blank"
                href="https://landgriffon.com"
                rel="noreferrer"
              >
                Learn more
              </a>
            </Link>
          </div>
        </div>
        <Media lessThan="md">
          <div style={{ top: '18%' }} className="absolute mr-6 -left-4">
            <Image width="710px" height="661px" src="/images/home/home-4.jpg" />
          </div>
        </Media>
        <Media greaterThanOrEqual="md">
          <div style={{ left: '-17%', top: '38%' }} className="absolute">
            <Image width="610px" height="565px" src="/images/home/home-4.jpg" />
          </div>
        </Media>
      </div>
    </Wrapper>
  </section>
);

export default HomeAbout;
