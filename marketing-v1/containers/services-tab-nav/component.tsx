import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

export interface ServicesTabNavProps {
  description: string;
  imageURL: string;
  subtitle: string;
  title: string;
}

const ServicesTabNav: React.FC<ServicesTabNavProps> = ({
  description,
  imageURL,
  subtitle,
  title,
}: ServicesTabNavProps) => (
  <section className="mt-20 py-28">
    <Wrapper>
      <Media greaterThanOrEqual="md">
        <nav className="relative flex flex-wrap items-center justify-between px-24 mt-1 text-2xl md:px-16 lg:px-40 xl:px-64 lg:text-5xl md:mt-0 navbar-expand-lg">
          <Link href="/services/measure">
            <h3 className="pb-px border-b-2 border-transparent opacity-50 cursor-pointer hover:opacity-100 hover:border-black hover:font-semibold">
              01 Measure
            </h3>
          </Link>
          <Link href="/services/analyze">
            <h3 className="pb-px border-b-2 border-transparent opacity-50 cursor-pointer hover:opacity-100 hover:font-semibold hover:border-black">
              02 Analyze
            </h3>
          </Link>
          <Link href="/services/forecast">
            <h3 className="pb-px border-b-2 border-transparent opacity-50 cursor-pointer hover:opacity-100 hover:border-black hover:font-semibold">
              03 Forecast
            </h3>
          </Link>
        </nav>
      </Media>
      <h1 className="text-5xl text-center font-semibold md:text-7xl border-b border-black pb-28 my-28 border-b-px">
        {title}
      </h1>
      <div className="grid md:grid-cols-3 gap-10 my-28">
        <h2 className="text-xl md:text-5xl font-semibold md:col-span-2">{subtitle}</h2>
        <p className="text-xl">{description}</p>
      </div>

      {/* <div className="flex justify-center pb-4 border-b border-black md:pt-8 md:pb-10 md:mx-0 xl:mx-16 border-b-px">
        <h1 className="font-sans text-4xl font-semibold md:font-normal md:font-semibold md:text-8xl">
          {title}
        </h1>
      </div>
      <div className="flex flex-col justify-between pt-10 pb-20 space-y-4 lg:space-x-10 md:space-x-10 md:py-16 xl:px-16 md:flex-row md:space-y-0">
        <h2 className="text-xl md:text-5xl md:w-2/4 font-semibold">{subtitle}</h2>
        <Media lessThan="md">
          <Image alt="Forecast" height="369px" width="768px" src={imageURL} />
        </Media>
        <p className="text-xl md:w-2/4 xl:w-2/5">{description}</p>
      </div> */}
    </Wrapper>
    <Wrapper hasPadding={false}>
      <Media greaterThanOrEqual="md">
        <div className="relative" style={{ height: 600 }}>
          <Image alt={title} objectFit="cover" layout="fill" src={imageURL} />
        </div>
      </Media>
    </Wrapper>
  </section>
);

export default ServicesTabNav;
