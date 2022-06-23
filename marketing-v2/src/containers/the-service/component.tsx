import React from 'react';

import Hero from 'containers/the-service/hero';
import Testimonials from 'containers/testimonials';
import Newsletter from 'containers/newsletter';

import Steps from 'containers/the-service/steps';
import Step01 from 'containers/the-service/steps/01/component';
import Step02 from 'containers/the-service/steps/02/component';

const TheService: React.FC = () => {
  return (
    <>
      <Hero />

      <Steps theme="green">
        <Step01 />
        <Step02 />
      </Steps>
      <Steps theme="orange">
        <Step01 />
      </Steps>
      <Steps theme="blue">
        <Step01 />
      </Steps>

      <Testimonials />
      <Newsletter />
    </>
  );
};

export default TheService;
