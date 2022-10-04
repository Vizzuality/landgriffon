import React from 'react';

import Image from 'next/image';

import Wrapper from 'containers/wrapper';

import { VALUES } from './constants';

const AboutValues: React.FC = () => (
  <section className="bg-lightBlue py-28">
    <Wrapper>
      <div className="md:grid md:grid-cols-2 gap-10">
        <h2 className="font-heading-2">Our values</h2>
        <ul className="space-y-16 lg:space-y-28">
          {VALUES.map((v) => (
            <li key={v.key} className="md:flex items-center">
              <div className="mr-10">
                <div className="mb-4">
                  <Image height="80px" width="80px" src={v.icon} />
                </div>
              </div>
              <div>
                <h3 className="font-heading-4 font-semibold mb-8">{v.title}</h3>
                <p>{v.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Wrapper>
  </section>
);

export default AboutValues;
