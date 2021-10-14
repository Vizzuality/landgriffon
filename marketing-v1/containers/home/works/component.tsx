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
        <h2 className="mb-12 text-xl md:text-5xl font-semibold text-green">How it works</h2>
        <p className="text-5xl font-light md:text-6xl">
          LandGriffon works anywhere where you are on your journey in managing your supply chain.
        </p>
      </Wrapper>
    </div>
    <div className="py-28 bg-lightBlue">
      <Wrapper>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {FEATURES.map((f) => (
            <li key={f.key}>
              <Image height="80px" width="80px" src={f.icon} />
              <h3 className="text-5xl font-semibold my-5">{f.title}</h3>
              <p className="text-base md:text-xl">{f.description}</p>
            </li>
          ))}
        </ul>
      </Wrapper>
    </div>
    <div className="py-28">
      <Wrapper hasPadding={false}>
        <h3 className="text-5xl text-center md:text-7xl">
          We are committed
          <br />
          to enabling change
        </h3>
        <p className="text-center md:text-xl md:w-2/4 mx-auto py-5">
          We help you to reach your commitments to become more sustainable.
        </p>
      </Wrapper>
    </div>
    <div>
      <Wrapper hasPadding={false}>
        <figure>
          <Media lessThan="md">
            <div className="relative" style={{ height: 408 }}>
              <Image
                alt="woman in plantation"
                layout="fill"
                objectFit="cover"
                src="/images/home/home-3.jpg"
              />
            </div>
          </Media>
          <Media greaterThanOrEqual="md">
            <div className="relative" style={{ height: 823 }}>
              <Image
                alt="woman in plantation"
                layout="fill"
                objectFit="cover"
                src="/images/home/home-3.jpg"
              />
            </div>
          </Media>
          <figcaption className="w-full px-3.5 md:px-16 py-10 bg-orange">
            <p className="my-5 font-light text-black md:text-3xl lg:text-5xl">
              We have an enormous opportunity —and <br />
              responsibility— to shape the future of our planet.
            </p>
          </figcaption>
        </figure>
      </Wrapper>
    </div>
    <div className="py-28">
      <Wrapper hasPadding={false}>
        <h2 className="text-5xl text-center font-light md:text-7xl">
          Designed to fit your <br />
          business needs.
        </h2>
        <p className="text-center md:text-xl md:w-2/4 mx-auto py-5">
          From Single Sign On to custom enterprise integrations, LandGriffon is built to adapt to
          your IT requirements and sustainability objectives.
        </p>
      </Wrapper>
    </div>
    <div>
      <Wrapper className="bg-blue py-28">
        <h2 className="text-5xl font-light text-white md:w-3/4 md:text-6xl lg:text-7xl">
          Learn how Landgriffon can work for you
        </h2>
        <Link href="/contact">
          <a
            className="inline-block mt-5 text-3xl text-white underline hover:no-underline"
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
