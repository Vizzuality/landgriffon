import React from 'react';

import Image from 'next/image';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

export const AboutHero = () => (
  <section className="relative w-full row-auto pb-5 pt-28">
    <div className="absolute top-0 left-0 w-full bg-white bg-center bg-cover h-4/6" />
    <div className="absolute bottom-0 left-0 w-full h-2/6 md:bg-bege" />

    <Wrapper>
      <div className="relative">
        <div className="flex justify-center pb-4 border-b border-black md:pb-10 md:pt-8 md:mx-16 border-b-px">
          <h1 className="font-sans text-5xl font-semibold md:font-normal md:font-sans-semibold md:text-7xl">
            Supported by a team of experts
          </h1>
        </div>
        <div className="flex flex-col justify-between py-10 space-y-4 md:pb-24 md:space-y-0 md:pt-16 md:flex-row md:px-16">
          <h4 className="font-sans text-xl font-semibold md:text-5xl md:w-2/4 md:font-normal md:font-sans-semibold">
            Our purpose is the creation of a better future for our planet and society.
          </h4>
          <p className="font-sans text-xl md:w-2/4 xl:w-2/5">
            We work closely with many of the organizations that are leading corporate sustainability
            standards, and can help you understand industry best practices.
          </p>
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <Media lessThan="md">
          <div className="flex justify-between space-x-4">
            <div>
              <Image width="473px" height="330px" src="/images/about/about-1.jpg" />
            </div>
            <div>
              <Image width="473px" height="330px" src="/images/about/about-3.jpg" />
            </div>
          </div>
          <Image width="768px" height="412px" src="/images/about/about-5.jpg" />
        </Media>
        <Media greaterThanOrEqual="md">
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
        </Media>
      </div>
      <div className="relative w-full md:grid md:grid-cols-2">
        <div />
        <div className="flex flex-col py-10 space-y-4 md:pl-4 md:py-24 md:pr-16">
          <h4 className="font-sans text-xl font-semibold md:text-5xl md:font-normal md:font-sans-semibold">
            We are on a mission to make supply chains more sustainable.{' '}
          </h4>
          <p className="font-sans text-base md:text-xl">
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
