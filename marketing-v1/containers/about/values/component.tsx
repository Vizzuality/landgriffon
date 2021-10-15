import React from 'react';

import Image from 'next/image';

import Wrapper from 'containers/wrapper';

import { VALUES } from './constants';

const AboutValues: React.FC = () => (
  <section className="bg-lightBlue py-28">
    <Wrapper>
      <div className="md:grid md:grid-cols-2 gap-10">
        <h4 className="text-5xl font-semibold md:font-normal md:text-6xl lg:text-7xl">
          Our values
        </h4>
        <ul className="space-y-28">
          {VALUES.map((v) => (
            <li key={v.key} className="md:flex items-center">
              <div className="mr-10">
                <div className="mb-4">
                  <Image height="80px" width="80px" src={v.icon} />
                </div>
              </div>
              <div>
                <h5 className="text-xl lg:text-5xl font-semibold mb-8">{v.title}</h5>
                <p className="font-sans text-base lg:text-xl">{v.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Wrapper>
  </section>
);

export default AboutValues;
