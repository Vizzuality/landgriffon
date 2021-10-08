import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import Wrapper from 'containers/wrapper';

import { FEATURES } from './constants';

const HomeWorks: React.FC = () => (
  <section className="font-sans">
    <div className="pt-20 pb-20 md:pt-40">
      <Wrapper>
        <div className="">
          <h2 className="pb-12 text-xl md:text-5xl font-sans-semibold text-green">How it works</h2>
          <div className="flex items-center justify-between">
            <h4 className="text-5xl font-semibold md:text-6xl md:font-normal">
              LandGriffon works anywhere where you are on your journey in managing your supply
              chain.
            </h4>
          </div>
        </div>
      </Wrapper>
    </div>
    <div className="py-28 bg-lightBlue">
      <Wrapper>
        <ul className="flex flex-col items-center justify-between space-y-20 md:space-y-0 md:space-x-10 md:flex-row">
          {FEATURES.map((f) => (
            <li key={f.key} className="flex flex-col space-y-6 md:space-y-0">
              <div>
                <Image height="80px" width="80px" src={f.icon} />
              </div>
              <div className="space-y-8">
                <h5 className="text-5xl font-sans-semibold">{f.title}</h5>
                <p className="font-sans text-base md:text-xl">{f.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Wrapper>
    </div>
    <div className="py-20 md:py-40">
      <Wrapper>
        <div className="flex flex-col pb-10 space-y-10 font-sans md:pb-40 md:items-center md:text-center">
          <h3 className="text-5xl font-semibold md:text-6xl md:font-normal">
            We are committed
            <br />
            to enabling change
          </h3>
          <p className="text-base md:text-xl md:w-2/4">
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
          <div className="w-full px-3.5 md:px-16 py-10 md:py-20 -mt-2 bg-orange">
            <h2 className="text-base font-semibold text-black md:font-normal md:text-5xl">
              We have an enormous opportunity —and <br />
              responsibility— to shape the future of our planet.
            </h2>
          </div>
        </div>
        <div className="flex flex-col py-20 space-y-10 font-sans md:text-center md:items-center md:py-40">
          <h3 className="text-5xl font-semibold md:text-6xl md:font-normal">
            Designed to fit your <br />
            business needs.
          </h3>
          <p className="text-base md:text-xl md:w-2/4">
            From Single Sign On to custom enterprise integrations, LandGriffon is built to adapt to
            your IT requirements and sustainability objectives.
          </p>
        </div>
        <div className="flex flex-col px-3.5 md:px-16 space-y-6 py-20 md:py-28 bg-blue">
          <h3 className="text-5xl font-semibold text-white md:font-normal md:w-3/4 md:text-7xl">
            Learn how Landgriffon can work for you
          </h3>
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

export default HomeWorks;
