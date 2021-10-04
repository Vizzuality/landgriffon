import React from 'react';

import Image from 'next/image';

import Wrapper from 'containers/wrapper';

export const HomeServices = () => (
  <section>
    <div className="pt-40 pb-20">
      <Wrapper>
        <h2 className="pb-12 text-5xl font-sans-semibold text-green">Services</h2>
        <div className="flex items-center justify-between font-sans">
          <h3 className="w-4/6 text-7xl">Measure and manage supply chain impacts.</h3>
          <p className="w-2/6 text-xl">
            LandGriffon is a powerful modeling tool backed by a team of experts to empower you to
            change your business for the better.
          </p>
        </div>
      </Wrapper>
    </div>
    <div className="bg-bege">
      <Wrapper>
        <div className="flex justify-between space-x-64 p-28">
          <Image
            alt="plantation from the sky"
            height="942px"
            width="588px"
            src="/images/home/home-2.jpg"
          />
          <nav className="flex flex-col self-center h-full space-y-10">
            <div className="border-b border-black">
              <a
                className="text-5xl underline font-sans-semibold hover:no-underline"
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
                className="text-5xl underline font-sans-semibold hover:no-underline"
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
                className="text-5xl underline font-sans-semibold hover:no-underline"
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
