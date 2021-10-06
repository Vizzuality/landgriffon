import React from 'react';

import Image from 'next/image';

import Wrapper from 'containers/wrapper';

import { VALUES } from './constants';

export const AboutValues = () => (
  <section className="w-full bg-lightBlue py-28 md:pb-36 md:pt-28">
    <Wrapper>
      <div className="md:grid md:grid-cols-2">
        <h4 className="mb-10 font-sans text-5xl font-semibold md:mb-0 md:font-normal md:text-7xl">
          Our values
        </h4>
        <ul className="flex flex-col space-y-16">
          {VALUES.map((v) => (
            <li key={v.key} className="flex flex-col md:items-center md:flex-row md:space-x-14">
              <div className="mb-4 md:mb-0">
                <Image height="80px" width="80px" src={v.icon} />
              </div>
              <div className="space-y-4 md:space-y-8">
                <h5 className="text-xl md:text-5xl font-sans-semibold">{v.title}</h5>
                <p className="font-sans text-base md:text-xl">{v.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Wrapper>
  </section>
);

export default AboutValues;
