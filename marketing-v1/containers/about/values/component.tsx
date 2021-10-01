import React from 'react';

import Image from 'next/image';

import Wrapper from 'containers/wrapper';

import { VALUES } from './constants';

export const AboutValues = () => (
  <section className="w-full font-sans bg-lightBlue">
    <Wrapper>
      <div className="grid grid-cols-2">
        <h4 className="text-7xl">Our values</h4>
        <ul className="flex flex-col space-y-16">
          {VALUES.map((v) => (
            <li key={v.key} className="flex items-center space-x-14">
              <div>
                <Image height="80px" width="80px" src={v.icon} />
              </div>
              <div className="space-y-8">
                <h5 className="text-5xl font-semibold">{v.title}</h5>
                <p className="text-xl">{v.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Wrapper>
  </section>
);

export default AboutValues;
