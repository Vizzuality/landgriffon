import React from 'react';

import Image from 'next/image';

import Wrapper from 'containers/wrapper';

const HomeServices: React.FC = () => (
  <section>
    <div className="pt-20 pb-20 md:pt-40">
      <Wrapper>
        <h2 className="pb-12 text-xl md:text-5xl font-sans-semibold text-green">Services</h2>
        <div className="flex flex-col items-center justify-between space-y-4 font-sans md:flex-row md:space-y-0">
          <h3 className="text-5xl font-semibold md:font-normal md:w-4/6 md:text-7xl">
            Measure and manage supply chain impacts.
          </h3>
          <p className="text-base md:text-xl md:w-2/6">
            LandGriffon is a powerful modeling tool backed by a team of experts to empower you to
            change your business for the better.
          </p>
        </div>
      </Wrapper>
    </div>
    <div className="bg-bege">
      <Wrapper>
        <div className="flex flex-col justify-between py-20 md:flex-row md:space-x-64 md:py-28 md:px-28">
          <Image
            alt="plantation from the sky"
            height="942px"
            width="588px"
            src="/images/home/home-2.jpg"
          />
          <nav className="flex flex-col self-center h-full space-y-10 pt-18 md:pt-0">
            <div className="border-b border-black">
              <a
                className="text-xl underline md:text-5xl font-sans-semibold hover:no-underline"
                href="/measure"
              >
                01 Measure
              </a>
              <p className="font-sans text-xl py-9">
                Turn procurement data into accurate estimates of environmental impacts.
              </p>
            </div>
            <div className="border-b border-black">
              <a
                className="text-xl underline md:text-5xl font-sans-semibold hover:no-underline"
                href="/analyze"
              >
                02 Analyze
              </a>
              <p className="font-sans text-xl py-9">
                Identify where your supply chain impacts are and uncover the key drivers.{' '}
              </p>
            </div>
            <div className="border-b border-black">
              <a
                className="text-xl underline mad:text-5xl font-sans-semibold hover:no-underline"
                href="/forecast"
              >
                03 Forecast
              </a>
              <p className="font-sans text-xl py-9">
                Prioritize areas for change and plot a path to sustainability.
              </p>
            </div>
          </nav>
        </div>
      </Wrapper>
    </div>
  </section>
);

export default HomeServices;
