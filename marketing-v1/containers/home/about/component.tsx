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
          <br /> a team of experts.
        </h4>
        <p className="text-base md:text-xl flex items-center">
          Our team brings expertise in environmental science, user-centric design, and satellite
          monitoring to help you reach a more sustainable future.
        </p>
      </div>
    </Wrapper>

    <Wrapper hasPadding={false}>
      <div className="grid md:grid-cols-12 gap-x-10 mb-28">
        <div className="md:col-span-9 md:col-start-4">
          <div className="bg-lightBlue px-6 py-10 md:px-16 md:py-16">
            <div className="grid md:grid-cols-2 gap-10">
              <h3 className="text-5xl md:text-7xl col-span-2">
                Our future is
                <br />a better future.
              </h3>
              <Media lessThan="md" className="col-span-2">
                <div className="relative" style={{ height: 250 }}>
                  <Image layout="fill" objectFit="cover" src="/images/home/home-4.jpg" />
                </div>
              </Media>
              <div className="md:col-span-1 md:col-start-2">
                <p className="md:text-4xl mb-10 md:mb-16">LandGriffon is built by: </p>
                <ul className="flex flex-col space-y-10 md:my-16 md:space-y-16 text-lg lg:text-5xl font-semibold">
                  <li>Vizzuality</li>
                  <li>Satelligence</li>
                </ul>
                <p className="md:text-4xl mb-10 md:mb-16">Advised by: </p>
                <ul className="flex flex-col space-y-10 md:my-16 md:space-y-16 text-lg lg:text-5xl font-semibold">
                  <li>SEI</li>
                </ul>
                <Link href="/about">
                  <a className="block mt-10 md:mt-16 text-lg text-black underline lg:text-5xl font-semibold hover:no-underline">
                    Learn more
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Media greaterThanOrEqual="md" className="relative md:col-span-7">
          <div className="relative md:col-span-7" style={{ height: 661, marginTop: -515 }}>
            <Image layout="fill" objectFit="cover" src="/images/home/home-4.jpg" />
          </div>
        </Media>
      </div>
    </Wrapper>
  </section>
);

export default HomeAbout;
