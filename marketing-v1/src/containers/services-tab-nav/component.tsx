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
  <section className="mt-20 md:py-28">
    <Wrapper>
      <Media greaterThanOrEqual="md">
        <nav className="relative flex flex-wrap items-center justify-between px-24 mt-1 md:px-16 lg:px-40 xl:px-64 md:mt-0 navbar-expand-lg">
          <Link href="/services/measure">
            <h3 className="font-semibold pb-px border-b-2 border-transparent opacity-50 cursor-pointer hover:opacity-100 hover:border-black">
              01 Measure
            </h3>
          </Link>
          <Link href="/services/analyze">
            <h3 className="font-semibold pb-px border-b-2 border-transparent opacity-50 cursor-pointer hover:opacity-100 hover:border-black">
              02 Analyze
            </h3>
          </Link>
          <Link href="/services/forecast">
            <h3 className="font-semibold pb-px border-b-2 border-transparent opacity-50 cursor-pointer hover:opacity-100 hover:border-black">
              03 Forecast
            </h3>
          </Link>
        </nav>
      </Media>
      <h1 className="font-heading-1 text-center border-b border-black pb-28 my-28 border-b-px">
        {title}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 my-28">
        <h2 className="font-heading-4 font-semibold lg:col-span-6">{subtitle}</h2>
        <p className="lg:col-start-8 lg:col-span-5">{description}</p>
      </div>
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
