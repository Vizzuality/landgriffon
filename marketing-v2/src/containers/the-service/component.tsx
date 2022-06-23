import React from 'react';

import Hero from 'containers/the-service/hero';
import Testimonials from 'containers/testimonials';
import Newsletter from 'containers/newsletter';

const TheService: React.FC = () => {
  return (
    <>
      <Hero />

      <Testimonials />
      <Newsletter />
    </>
  );
};

export default TheService;
