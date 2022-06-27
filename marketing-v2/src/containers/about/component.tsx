import React from 'react';

import Hero from 'containers/about/hero';

import Testimonials from 'containers/testimonials';
import Newsletter from 'containers/newsletter';

const About: React.FC = () => {
  return (
    <>
      <Hero />

      <Testimonials />
      <Newsletter />
    </>
  );
};

export default About;
