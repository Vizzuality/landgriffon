import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

const HomeAbout: React.FC = () => (
  <section>
    <Wrapper className="py-28">
      <h2 className="mb-12 text-xl md:text-5xl font-semibold text-green">About us</h2>
      <div className="grid md:grid-cols-3 gap-10">
        <h4 className="text-5xl font-light col-span-2 md:text-6xl lg:text-7xl">
          Supported by
          <br /> a team of experts
        </h4>
        <p className="text-base md:text-xl flex items-center">
          Our team brings expertise in environmental science, user-centric design, and satellite
          monitoring to help you reach a more sustainable future.
        </p>
      </div>
    </Wrapper>
    <Wrapper className="flex justify-end">
      <div className="relative flex flex-col px-16 py-8 lg:py-16 xl:w-4/5 md:px-18 xl:self-end bg-lightBlue">
        <p className="w-3/4 text-5xl font-semibold text-black pb-96 lg:pb-16 md:text-6xl md:font-normal">
          Our future is a better future
        </p>
        <div className="md:grid md:grid-cols-2 md:gap-10">
          <div className="invisible md:visible" />
          <div className="lg:px-10">
            <p className="text-base md:pt-64 md:text-2xl xl:pt-0 lg:text-4xl">
              LandGriffon is built by:
            </p>
            <ul className="flex flex-col py-6 space-y-6 text-lg lg:py-16 xl:space-y-12 lg:text-5xl font-semibold">
              <li>Vizzuality</li>
              <li>Satelligence</li>
              <li>SEI</li>
            </ul>
            <Link href="https://landgriffon.com">
              <a
                className="text-lg text-black underline lg:text-5xl font-semibold hover:no-underline"
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

        <Media at="md">
          <div style={{ top: '20%' }} className="absolute mr-6 -left-4">
            <Image width="610px" height="561px" src="/images/home/home-4.jpg" />
          </div>
        </Media>

        <Media at="lg">
          <div style={{ top: '26%' }} className="absolute mr-6 -left-16">
            <Image width="510px" height="461px" src="/images/home/home-4.jpg" />
          </div>
        </Media>

        <Media greaterThanOrEqual="xl">
          <div style={{ top: '30%' }} className="absolute -left-1/4 ml-16">
            <Image width="610px" height="565px" src="/images/home/home-4.jpg" />
          </div>
        </Media>
      </div>
    </Wrapper>
  </section>
);

export default HomeAbout;
