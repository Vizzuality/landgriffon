import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

const HomeAbout: React.FC = () => (
  <section className="flex flex-col flex-grow w-full h-full row-auto pt-4 mx-auto font-sans pb-26 xl:pb-72 md:container">
    <Wrapper hasPadding={false}>
      <div className="xl:px-16 lg:px-10">
        <h2 className="pb-12 text-xl md:text-5xl font-semibold text-green">About us</h2>
        <div className="flex flex-col items-center justify-between pb-24 space-y-4 lg:space-x-24 lg:flex-row">
          <h4 className="text-5xl font-light lg:w-3/5 md:text-6xl lg:text-7xl">
            Supported by
            <br /> a team of experts
          </h4>
          <p className="text-base md:text-xl lg:w-2/5">
            Our team brings expertise in environmental science, user-centric design, and satellite
            monitoring to help you reach a more sustainable future.
          </p>
        </div>
      </div>
      <div className="relative flex flex-col px-16 py-8 lg:py-16 xl:w-4/5 md:px-18 xl:self-end bg-lightBlue">
        <p className="w-3/4 text-5xl font-semibold text-black pb-96 lg:pb-16 md:text-6xl md:font-normal">
          Our future is a better future
        </p>
        <div className="md:grid md:grid-cols-2">
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
