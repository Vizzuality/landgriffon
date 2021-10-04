import React from 'react';

import Wrapper from 'containers/wrapper';

export const HomeAbout = () => (
  <section className="flex flex-col flex-grow w-full h-full row-auto pt-4 pb-5 mx-auto font-sans md:container">
    <Wrapper>
      <div className="px-16">
        <h2 className="pb-12 text-5xl font-sans-semibold text-green">About us</h2>
        <div className="flex items-center justify-between space-x-24">
          <h4 className="w-3/5 text-6xl">Supported by a team of experts </h4>
          <p className="w-2/5 text-xl">
            Our team brings expertise in environmental science, user-centric design, and satellite
            monitoring to help you reach a more sustainable future.
          </p>
        </div>
      </div>
    </Wrapper>
  </section>
);

export default HomeAbout;
