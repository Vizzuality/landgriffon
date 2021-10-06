import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

export interface HeroProps {
  description: string;
  imageURL: string;
  subtitle: string;
  title: string;
}

export const Hero: React.FC<HeroProps> = ({
  description,
  imageURL,
  subtitle,
  title,
}: HeroProps) => (
  <section className="w-full row-auto pt-24 font-sans md:pt-20 md:pb-5 md:pt-28">
    <Wrapper>
      <Media greaterThanOrEqual="md">
        <nav className="relative flex flex-wrap items-center justify-between px-24 mt-1 text-2xl lg:px-48 xl:px-64 lg:text-5xl md:mt-0 navbar-expand-lg">
          <Link href="/measure">
            <h3 className="pb-px border-b-2 border-transparent opacity-50 cursor-pointer hover:opacity-100 hover:border-black hover:font-sans-semibold">
              01 Measure
            </h3>
          </Link>
          <Link href="/analyze">
            <h3 className="pb-px border-b-2 border-transparent opacity-50 cursor-pointer hover:opacity-100 hover:font-sans-semibold hover:border-black">
              02 Analyze
            </h3>
          </Link>
          <Link href="/forecast">
            <h3 className="pb-px border-b-2 border-transparent opacity-50 cursor-pointer hover:opacity-100 hover:border-black hover:font-sans-semibold">
              03 Forecast
            </h3>
          </Link>
        </nav>
      </Media>
      <div className="flex justify-center pb-4 border-b border-black md:pt-8 md:pb-10 md:mx-16 border-b-px">
        <h1 className="font-sans text-4xl font-semibold md:font-normal md:font-sans-semibold md:text-8xl">
          {title}
        </h1>
      </div>
      <div className="flex flex-col justify-between pt-10 pb-20 space-y-4 md:py-16 md:px-16 md:flex-row md:space-y-0">
        <h4 className="text-xl md:text-5xl md:w-2/4 font-sans-semibold">{subtitle}</h4>
        <Media lessThan="md">
          <Image alt="Forecast" height="369px" width="768px" src={imageURL} />
        </Media>
        <p className="text-xl md:w-2/4 xl:w-2/5">{description}</p>
      </div>
      <Media greaterThanOrEqual="md">
        <Image alt="Forecast" height="600px" width="1440px" src={imageURL} />
      </Media>
    </Wrapper>
  </section>
);

export default Hero;
