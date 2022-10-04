import React from 'react';

import Image from 'next/image';

import Wrapper from 'containers/wrapper';

const ForecastContent: React.FC = () => (
  <Wrapper hasPadding={false}>
    <section className="grid md:grid-cols-12 gap-x-10 gap-y-28 mb-28">
      <div className="md:col-span-5 space-y-10 self-items-center">
        <h3 className="font-heading-4 font-semibold mt-10">
          Explore sourcing options to find the best path forward.
        </h3>
        <p>
          See how buying from different suppliers, changing product formulas, or partnering with
          others can improve supply chain performance. Analyze the trade offs between different
          approaches to build an argument for change.
        </p>
      </div>
      <div className="md:col-span-7 flex justify-end">
        <Image width="657px" height="351px" src="/images/forecast/forecast-2.jpg" />
      </div>

      <div className="md:col-span-7">
        <Image width="657px" height="351px" src="/images/forecast/forecast-3.jpg" />
      </div>
      <div className="md:col-span-5 space-y-10 self-items-center">
        <h3 className="font-heading-4 font-semibold mt-10">Plot a path to sustainability.</h3>
        <p>
          Draw out a plan for how your company will reach its targets. Illustrate and communicate
          how your company can and must evolve to be successful in tomorrow’s world.
        </p>
      </div>
    </section>
  </Wrapper>
);

export default ForecastContent;
