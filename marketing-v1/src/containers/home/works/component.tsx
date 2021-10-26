import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

import { FEATURES } from './constants';

const HomeWorks: React.FC = () => (
  <section>
    <div className="py-28">
      <Wrapper>
        <h2 className="mb-12 font-heading-4 font-semibold text-green">How it works</h2>
        <p className="font-heading-2">
          LandGriffon works with you wherever you are on your journey to sustainable supply chain
          management.
        </p>
      </Wrapper>
    </div>
    <div className="py-28 bg-lightBlue">
      <Wrapper>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {FEATURES.map((f) => (
            <li key={f.key}>
              <Image height="80px" width="80px" src={f.icon} />
              <h3 className="font-heading-4 font-semibold my-5">{f.title}</h3>
              <p>{f.description}</p>
            </li>
          ))}
        </ul>
      </Wrapper>
    </div>
    <div className="py-28">
      <Wrapper hasPadding={false}>
        <h3 className="text-center font-heading-2">
          We are committed
          <br />
          to enabling change.
        </h3>
        <p className="text-center md:text-xl md:w-2/4 mx-auto mt-10">
          We help you to reach your commitments to become more sustainable.
        </p>
      </Wrapper>
    </div>
    <div>
      <Wrapper hasPadding={false}>
        <figure>
          <Media lessThan="lg">
            <div className="relative" style={{ height: 408 }}>
              <Image
                alt="woman in plantation"
                layout="fill"
                objectFit="cover"
                src="/images/home/home-3.jpg"
              />
            </div>
          </Media>
          <Media greaterThanOrEqual="lg">
            <div className="relative" style={{ height: 823 }}>
              <Image
                alt="woman in plantation"
                layout="fill"
                objectFit="cover"
                src="/images/home/home-3.jpg"
              />
            </div>
          </Media>
          <figcaption className="grid lg:grid-cols-12 w-full px-3.5 md:px-16 py-10 bg-orange">
            <p className="lg:col-span-7 my-5 font-heading-4 font-semibold">
              We have an enormous opportunity —and responsibility— to shape the future of our
              planet.
            </p>
          </figcaption>
        </figure>
      </Wrapper>
    </div>
    <div className="py-28">
      <Wrapper hasPadding={false}>
        <h2 className="font-heading-2 text-center">
          Designed to fit your <br />
          business needs.
        </h2>
        <p className="text-center md:w-2/4 mx-auto mt-10">
          From Single Sign On to custom enterprise integrations, LandGriffon is built to adapt to
          your IT requirements and sustainability objectives.
        </p>
      </Wrapper>
    </div>
    <div>
      <Wrapper className="bg-blue py-28">
        <h2 className="font-heading-2 text-white md:w-3/4">
          Learn how Landgriffon can work for you.
        </h2>
        <Link href="/contact">
          <a
            className="inline-block mt-5 font-heading-4 text-white underline hover:no-underline"
            rel="noreferrer"
          >
            Contact us
          </a>
        </Link>
      </Wrapper>
    </div>
  </section>
);

export default HomeWorks;
