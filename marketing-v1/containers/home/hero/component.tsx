import React from 'react';

import Image from 'next/image';

import { Media } from 'containers/media';

export interface HomeHeroProps {
  onSignUp: () => void;
}

const HomeHero: React.FC<HomeHeroProps> = ({ onSignUp }: HomeHeroProps) => (
  <section className="px-3.5 md:px-0 flex flex-col flex-grow w-full h-full row-auto pt-4 pb-5 mx-auto font-sans md:container">
    <div className="relative -mb-2">
      <Media lessThan="md">
        <Image
          alt="path in plantation"
          height="408px"
          width="450px"
          src="/images/home/home-mb-1.jpg"
        />
      </Media>
      <Media greaterThanOrEqual="md">
        <Image
          alt="path in plantation"
          height="600px"
          width="1600px"
          src="/images/home/home-1.jpg"
        />
      </Media>
      <h2 className="absolute w-4/5 text-4xl font-semibold text-white md:font-normal md:bottom-16 bottom-6 left-3.5 md:left-12 xl:left-16 md:text-6xl xl:text-7xl">
        Reach your supply chain sustainability targets
      </h2>
    </div>
    <div className="px-3.5 md:px-12 xl:px-16 md:py-12 py-7 text-base text-white md:text-3xl bg-green">
      <div className="md:space-y-8 xl:w-2/4">
        <p className="font-semibold md:font-normal">
          We help companies become sustainable by understanding and planning strategies to manage
          environmental impacts and risks in food supply chains.{' '}
        </p>
        <Media greaterThan="md">
          <button type="button" onClick={onSignUp}>
            <h3 className="underline cursor-pointer font-sans-semibold hover:no-underline">
              Sign up to know more about LandGriffon
            </h3>
          </button>
        </Media>
      </div>
    </div>
  </section>
);

export default HomeHero;
