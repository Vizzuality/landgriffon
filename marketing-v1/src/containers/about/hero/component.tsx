import React from 'react';

import Image from 'next/image';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

const AboutHero: React.FC = () => (
  <section className="mt-20">
    <div className="py-28">
      <Wrapper>
        <h1 className="font-heading-1 text-center border-b border-black pb-28 mb-28 border-b-px">
          Supported by a team of experts
        </h1>
        <div className="grid md:grid-cols-2 gap-10">
          <h2 className="font-heading-4 font-semibold">
            Our purpose is the creation of a better future for our planet and society.
          </h2>
          <p>
            We work closely with many of the organizations that are leading corporate sustainability
            standards, and can help you understand industry best practices.
          </p>
        </div>
      </Wrapper>
    </div>

    <div className="py-28 bg-beige" style={{ marginTop: '560px' }}>
      <div style={{ marginTop: '-560px' }}>
        <Wrapper hasPadding={false}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-10">
            <div className="relative md:col-span-2" style={{ height: 330 }}>
              <Image objectFit="cover" layout="fill" src="/images/about/about-1.jpg" />
            </div>
            <div className="relative md:col-span-2" style={{ height: 330 }}>
              <Image objectFit="cover" layout="fill" src="/images/about/about-2.jpg" />
            </div>
            <Media greaterThanOrEqual="md" className="relative hidden md:block md:col-span-2">
              <Image objectFit="cover" layout="fill" src="/images/about/about-3.jpg" />
            </Media>
            <Media greaterThanOrEqual="md" className="relative hidden md:block md:col-span-3">
              <Image objectFit="cover" layout="fill" src="/images/about/about-4.jpg" />
            </Media>
            <div className="relative md:col-span-3" style={{ height: 386 }}>
              <Image objectFit="cover" layout="fill" src="/images/about/about-5.jpg" />
            </div>
            <div className="md:col-start-4 md:col-span-3">
              <h2 className="font-heading-4 font-semibold mt-28 mb-10">
                We are on a mission to make supply chains more sustainable.
              </h2>
              <p>
                The world is moving to a zero-carbon and nature positive future. We offer our
                expertise in environmental monitoring, designing user-centric scientific
                applications, and artificial intelligence based satellite monitoring to help
                companies reach this tomorrow.
              </p>
            </div>
          </div>
        </Wrapper>
      </div>
    </div>
  </section>
);

export default AboutHero;
