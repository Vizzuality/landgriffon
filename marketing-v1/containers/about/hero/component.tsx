import React from 'react';

import Image from 'next/image';

import Wrapper from 'containers/wrapper';

export const AboutHero = () => (
  <section className="w-full row-auto pb-5 font-sans pt-28 ">
    <Wrapper>
      <div className="flex justify-center pt-32 pb-10 mx-16 border-b border-black border-b-px">
        <h1 className="font-semibold text-7xl">Supported by a team of experts</h1>
      </div>
      <div className="flex justify-between px-16 pt-16 pb-24">
        <h4 className="w-2/4 text-5xl font-semibold">
          Our purpose is the creation of a better future for our planet and society.
        </h4>
        <p className="w-2/4 text-xl xl:w-2/5">
          We work closely with many of the organizations that are leading corporate sustainability
          standards, and can help you understand industry best practices.
        </p>
      </div>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between space-x-4">
          <div>
            <Image width="433px" height="305px" src="/images/about/about-1.jpg" />
          </div>
          <div>
            <Image width="433px" height="305px" src="/images/about/about-2.jpg" />
          </div>
          <div>
            <Image width="433px" height="305px" src="/images/about/about-3.jpg" />
          </div>
        </div>
        <div className="flex justify-between space-x-4">
          <div>
            <Image width="660px" height="354px" src="/images/about/about-4.jpg" />
          </div>
          <div>
            <Image width="660px" height="354px" src="/images/about/about-5.jpg" />
          </div>
        </div>
      </div>
    </Wrapper>
  </section>
);

export default AboutHero;
