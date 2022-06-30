import React from 'react';

import Hero from 'containers/the-service/hero';
// import Example from 'containers/the-service/example';

import Steps from 'containers/the-service/steps';
import Step01 from 'containers/the-service/steps/01';
import Step02 from 'containers/the-service/steps/02';
import Step03 from 'containers/the-service/steps/03';
import Step04 from 'containers/the-service/steps/04';
import Step05 from 'containers/the-service/steps/05';
import Step06 from 'containers/the-service/steps/06';
import AppScreens from 'containers/the-service/app-screens';

import Separator from 'containers/separator';
import Testimonials from 'containers/testimonials';
import Newsletter from 'containers/newsletter';

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
      <AppScreens />
      {/* <Example /> */}
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
