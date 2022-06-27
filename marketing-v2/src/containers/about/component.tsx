import React from 'react';

import Hero from 'containers/about/hero';
import How from 'containers/about/how';

import Testimonials from 'containers/testimonials';
import Newsletter from 'containers/newsletter';

const About: React.FC = () => {
  return (
    <>
      <Hero />
      <How />

      <Testimonials />
      <Newsletter />
    </>
  );
};

export default About;
