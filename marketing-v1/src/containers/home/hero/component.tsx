import React from 'react';

import Image from 'next/image';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

export interface HomeHeroProps {
  onSignUp: () => void;
}

const HomeHero: React.FC<HomeHeroProps> = ({ onSignUp }: HomeHeroProps) => (
  <section className="mt-20">
    <Wrapper hasPadding={false}>
      <div className="relative">
        <Media lessThan="md">
          <div className="relative" style={{ height: 408 }}>
            <Image
              alt="path in plantation"
              src="/images/home/home-1.jpg"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </Media>
        <Media greaterThanOrEqual="md">
          <div className="relative" style={{ height: 600 }}>
            <Image
              alt="path in plantation"
              src="/images/home/home-1.jpg"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </Media>
        <h1 className="absolute w-4/5 font-heading-2 font-normal text-white md:font-light md:bottom-16 bottom-6 left-3.5 md:left-12 xl:left-16">
          Reach your supply chain sustainability targets.
        </h1>
      </div>
      <div className="px-3.5 md:px-12 xl:px-16 md:py-12 py-7 text-white bg-green">
        <div className="md:space-y-8 xl:w-2/4">
          <p>
            We help companies become sustainable by understanding and planning strategies to manage
            environmental impacts and risks in supply chains.
          </p>
          <Media greaterThan="md">
            <button type="button" onClick={onSignUp}>
              <span className="underline cursor-pointer font-semibold hover:no-underline">
                Sign up to know more about LandGriffon
              </span>
            </button>
          </Media>
        </div>
      </div>
    </Wrapper>
  </section>
);

export default HomeHero;
