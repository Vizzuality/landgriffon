import React from 'react';

import Hero from 'containers/the-service/hero';
import Separator from 'containers/the-service/separator';
import Testimonials from 'containers/testimonials';
import Newsletter from 'containers/newsletter';

import Steps from 'containers/the-service/steps';
import Step01 from 'containers/the-service/steps/01';
import Step02 from 'containers/the-service/steps/02';
import Step03 from 'containers/the-service/steps/03';
import Step04 from 'containers/the-service/steps/04';
import Step05 from 'containers/the-service/steps/05';
import Step06 from 'containers/the-service/steps/06';

const TheService: React.FC = () => {
  return (
    <>
      <Hero />

      <Steps theme="green">
        <Step01 />
        <Step02 />
      </Steps>
      <Separator image="/images/service/images6_service.jpg" />
      <Steps theme="orange">
        <Step03 />
        <Step04 />
      </Steps>
      <Separator image="/images/service/images7_service.jpg" />
      <Steps theme="blue">
        <Step05 />
        <Step06 />
      </Steps>

      <Testimonials />
      <Newsletter />
    </>
  );
};

export default TheService;
