import React from 'react';

import Image from 'next/image';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

import { VALUES } from './constants';

const AboutValues: React.FC = () => (
  <section className="w-full bg-lightBlue py-28 lg:pb-36 lg:pt-28">
    <Wrapper>
      <div className="md:grid md:grid-cols-2">
        <h4 className="mb-10 font-sans text-5xl font-semibold md:mb-0 md:font-normal md:text-6xl lg:text-7xl">
          Our values
        </h4>
        <ul className="flex flex-col space-y-16">
          {VALUES.map((v) => (
            <li
              key={v.key}
              className="flex flex-col md:items-center md:flex-row md:space-x-4 lg:space-x-6 xl:space-x-14"
            >
              <Media lessThan="md">
                <div className="mb-4">
                  <Image height="80px" width="80px" src={v.icon} />
                </div>
              </Media>
              <Media at="md">
                <div className="mb-28">
                  <Image height="100px" width="100px" src={v.icon} />
                </div>
              </Media>
              <Media at="lg">
                <div className="mb-28">
                  <Image height="120px" width="120px" src={v.icon} />
                </div>
              </Media>
              <Media greaterThanOrEqual="xl">
                <div className="mb-4">
                  <Image height="80px" width="80px" src={v.icon} />
                </div>
              </Media>
              <div className="space-y-4 md:space-y-8">
                <h5 className="text-xl lg:text-5xl font-sans-semibold">{v.title}</h5>
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
