import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import Wrapper from 'containers/wrapper';

import { FEATURES } from './constants';

export const HomeFeatures = () => (
  <section className="font-sans">
    <div className="pt-40 pb-20">
      <Wrapper>
        <h2 className="pb-12 text-5xl font-sans-semibold text-green">How it works</h2>
        <div className="flex items-center justify-between">
          <h4 className="text-6xl">
            LandGriffon works anywhere where you are on your journey in managing your supply chain.
          </h4>
        </div>
      </Wrapper>
    </div>
    <div className="py-28 bg-lightBlue">
      <Wrapper>
        <ul className="flex items-center justify-between space-x-10">
          {FEATURES.map((f) => (
            <li key={f.key} className="flex flex-col">
              <div>
                <Image height="80px" width="80px" src={f.icon} />
              </div>
              <div className="space-y-8">
                <h5 className="text-5xl font-sans-semibold">{f.title}</h5>
                <p className="font-sans text-xl">{f.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Wrapper>
    </div>
    <div className="py-40">
      <Wrapper>
        <div className="flex flex-col items-center pb-40 space-y-10 font-sans text-center">
          <h3 className="text-7xl">
            We are committed
            <br />
            to enabling change
          </h3>
          <p className="w-2/4 text-xl">
            We help you to reach your commitments to become more sustainable.
          </p>
        </div>
        <div className="relative -mb-2">
          <Image
            alt="woman in plantation"
            height="823px"
            width="1600px"
            src="/images/home/home-3.jpg"
          />
          <div className="w-full px-16 py-20 -mt-2 bg-orange">
            <h2 className="text-5xl text-black">
              We have an enormous opportunity —and <br />
              responsibility— to shape the future of our planet.
            </h2>
          </div>
        </div>
        <div className="flex flex-col items-center py-40 space-y-10 font-sans text-center">
          <h3 className="text-7xl">
            Designed to fit your <br />
            business needs.
          </h3>
          <p className="w-2/4 text-xl">
            From Single Sign On to custom enterprise integrations, LandGriffon is built to adapt to
            your IT requirements and sustainability objectives.
          </p>
        </div>
        <div className="flex flex-col px-16 space-y-6 py-28 bg-blue">
          <h3 className="w-3/4 text-white text-7xl">Learn how Landgriffon can work for you</h3>
          <Link href="https://landgriffon.com">
            <a
              className="text-3xl text-white underline hover:no-underline"
              target="_blank"
              href="https://landgriffon.com"
              rel="noreferrer"
            >
              Contact us
            </a>
          </Link>
        </div>
      </Wrapper>
    </div>
  </section>
);

export default HomeFeatures;
