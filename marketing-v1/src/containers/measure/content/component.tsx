import React from 'react';

import Image from 'next/image';

import Wrapper from 'containers/wrapper';

const MeasureContent: React.FC = () => (
  <Wrapper>
    <section className="grid md:grid-cols-12 gap-x-10 gap-y-28 mb-28">
      <div className="md:col-span-5">
        <div className="relative" style={{ height: 575 }}>
          <Image layout="fill" objectFit="cover" src="/images/measure/measure-2.jpg" />
        </div>
        <div className="space-y-10">
          <h3 className="font-heading-4 font-semibold mt-10">
            Track and anticipate deforestation risk with Satelligence AI.
          </h3>
          <p>
            Be the first to know about deforestation risk in your supply chain and identify
            responsible parties to get ahead of grievances.
          </p>
          <p>
            <a
              href="https://satelligence.com/solutions"
              className="font-semibold underline hover:no-underline"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
      <div className="md:col-span-5 md:col-start-8">
        <div className="relative" style={{ height: 575 }}>
          <Image layout="fill" objectFit="cover" src="/images/measure/measure-3.jpg" />
        </div>
        <div className="space-y-10">
          <h3 className="font-heading-4 font-semibold mt-10">
            Calculate impacts with our catalog of trusted data.
          </h3>
          <p>
            Generate accurate estimates of carbon emissions, water risk, and more based on trusted
            data from leading scientific and NGO sources. Add custom indicators and targets to track
            risks or progress over time.
          </p>
        </div>
      </div>
    </section>
  </Wrapper>
);

export default MeasureContent;
