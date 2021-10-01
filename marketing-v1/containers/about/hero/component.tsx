import React from 'react';

import Image from 'next/image';

import Wrapper from 'containers/wrapper';

export const AboutHero = () => (
  <section className="relative w-full row-auto pb-5 pt-28">
    <div className="absolute top-0 left-0 w-full bg-white bg-center bg-cover h-4/6" />
    <div className="absolute bottom-0 left-0 w-full h-2/6 bg-bege" />

    <Wrapper>
      <div className="relative">
        <div className="flex justify-center pt-32 pb-10 mx-16 border-b border-black border-b-px">
          <h1 className="font-sans-semibold text-7xl">Supported by a team of experts</h1>
        </div>
        <div className="flex justify-between px-16 pt-16 pb-24">
          <h4 className="w-2/4 text-5xl font-sans-semibold">
            Our purpose is the creation of a better future for our planet and society.
          </h4>
          <p className="w-2/4 font-sans text-xl xl:w-2/5">
            We work closely with many of the organizations that are leading corporate sustainability
            standards, and can help you understand industry best practices.
          </p>
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between space-x-4">
          <div>
            <Image width="473px" height="330px" src="/images/about/about-1.jpg" />
          </div>
          <div>
            <Image width="473px" height="330px" src="/images/about/about-2.jpg" />
          </div>
          <div>
            <Image width="473px" height="330px" src="/images/about/about-3.jpg" />
          </div>
        </div>
        <div className="flex justify-between space-x-4">
          <div>
            <Image width="720px" height="386px" src="/images/about/about-4.jpg" />
          </div>
          <div>
            <Image width="720px" height="386px" src="/images/about/about-5.jpg" />
          </div>
        </div>
      </div>
      <div className="relative grid w-full grid-cols-2">
        <div />
        <div className="flex flex-col py-24 pl-4 pr-16 space-y-4">
          <h4 className="text-5xl font-sans-semibold">
            We are on a mission to make supply chains more sustainable.{' '}
          </h4>
          <p className="font-sans text-xl">
            The world is moving to a zero-carbon future and nature positive. We offer our expertise
            in environmental monitoring, designing user-centric scientific applications, and
            artificial intelligence based satellite monitoring to help companies reach this
            tomorrow.
          </p>
        </div>
      </div>
    </Wrapper>
  </section>
);

export default AboutHero;
