import React from 'react';

import Hero from 'containers/about/hero';
import How from 'containers/about/how';
import Video from 'containers/about/video';
import Values from 'containers/about/values';
import Reason from 'containers/about/reason';
import Team from 'containers/about/team';

import Testimonials from 'containers/testimonials';
import Newsletter from 'containers/newsletter';
import Separator from 'containers/separator';

const About: React.FC = () => {
  return (
    <>
      <Hero />
      <How />
      <Video />
      <Values />
      <Reason />
      <Separator image="/images/service/images6_service.jpg" />
      <Team />

      <Testimonials />
      <Newsletter />
    </>
  );
};

export default About;
