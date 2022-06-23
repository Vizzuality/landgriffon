import React from 'react';

import Hero from 'containers/the-service/hero';
import Testimonials from 'containers/testimonials';
import Newsletter from 'containers/newsletter';

import Steps from 'containers/the-service/steps';
import Step01 from 'containers/the-service/steps/01/component';
import Step02 from 'containers/the-service/steps/02/component';
import Step03 from 'containers/the-service/steps/03/component';
import Step04 from 'containers/the-service/steps/04/component';

const TheService: React.FC = () => {
  return (
    <>
      <Hero />

      <Steps theme="green">
        <Step01 />
        <Step02 />
      </Steps>
      <Steps theme="orange">
        <Step03 />
        <Step04 />
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
