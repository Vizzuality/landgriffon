import React from 'react';

import Image from 'next/image';

import Wrapper from 'containers/wrapper';

import { FEATURES } from './constants';

export const HomeFeatures = () => (
  <>
    <section className="pt-40 pb-20">
      <Wrapper>
        <h2 className="pb-12 text-5xl font-sans-semibold text-green">How it works</h2>
        <div className="flex items-center justify-between">
          <h3 className="font-sans text-6xl">
            LandGriffon works anywhere where you are on your journey in managing your supply chain.
          </h3>
        </div>
      </Wrapper>
    </section>
    <section className="py-28 bg-lightBlue">
      <Wrapper>
        <ul className="flex items-center justify-between space-x-10">
          {FEATURES.map((f) => (
            <li key={f.key} className="flex flex-col">
              <div>
                <Image height="80px" width="80px" src={f.icon} />
              </div>
              <div className="space-y-8">
                <h5 className="text-5xl font-sans-semibold">{f.title}</h5>
                <p className="font-sans text-xl">{f.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Wrapper>
    </section>
  </>
);

export default HomeFeatures;
