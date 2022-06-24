import React from 'react';

import Hero from 'containers/methodology/hero';

import Steps from 'containers/methodology/steps';
import Step01 from 'containers/methodology/steps/01';
import Step02 from 'containers/methodology/steps/02';

import Testimonials from 'containers/testimonials';
import Newsletter from 'containers/newsletter';

const Methodology: React.FC = () => {
  return (
    <>
      <Hero />

      <Steps>
        <Step01 />
        <Step02 />
      </Steps>

      <Testimonials />
      <Newsletter />
    </>
  );
};

export default Methodology;
