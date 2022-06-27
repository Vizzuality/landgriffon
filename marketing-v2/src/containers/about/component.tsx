import React from 'react';

import Hero from 'containers/about/hero';
import How from 'containers/about/how';
import Video from 'containers/about/video';
import Values from 'containers/about/values';

import Testimonials from 'containers/testimonials';
import Newsletter from 'containers/newsletter';

const About: React.FC = () => {
  return (
    <>
      <Hero />
      <How />
      <Video />
      <Values />

      <Testimonials />
      <Newsletter />
    </>
  );
};

export default About;
