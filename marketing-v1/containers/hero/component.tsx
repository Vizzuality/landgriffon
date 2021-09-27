import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

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
  <section className="w-full row-auto pb-5 font-sans pt-28 ">
    <Wrapper>
      <nav className="relative flex flex-wrap items-center justify-between px-24 mt-1 text-2xl lg:px-48 xl:px-64 lg:text-5xl md:mt-0 navbar-expand-lg">
        <Link href="/measure">
          <h3 className="pb-px border-b-2 border-transparent opacity-50 cursor-pointer hover:opacity-100 hover:border-black hover:font-semibold">
            01 Measure
          </h3>
        </Link>
        <Link href="/analyze">
          <h3 className="pb-px border-b-2 border-transparent opacity-50 cursor-pointer hover:opacity-100 hover:font-semibold hover:border-black">
            02 Analyze
          </h3>
        </Link>
        <Link href="/forecast">
          <h3 className="pb-px border-b-2 border-transparent opacity-50 cursor-pointer hover:opacity-100 hover:border-black hover:font-semibold">
            03 Forecast
          </h3>
        </Link>
      </nav>
      <div className="flex justify-center pt-8 pb-10 mx-16 border-b border-black border-b-px">
        <h1 className="font-semibold text-8xl">{title}</h1>
      </div>
      <div className="flex justify-between px-16 py-16">
        <h4 className="w-2/4 text-5xl font-semibold">{subtitle}</h4>
        <p className="w-2/4 text-xl xl:w-2/5">{description}</p>
      </div>
      <Image alt="Forecast" height="600px" width="1440px" src={imageURL} />
    </Wrapper>
  </section>
);

export default Hero;
