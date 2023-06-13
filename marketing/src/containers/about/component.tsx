import React from 'react';

import Hero from 'containers/about/hero';
import How from 'containers/about/how';
import Video from 'containers/about/video';
import Values from 'containers/about/values';
import Reason from 'containers/about/reason';
import Team from 'containers/about/team';

import Newsletter from 'containers/newsletter';
import Separator from 'containers/separator';
import ScrollDown from 'containers/scroll-down';

const About: React.FC = () => {
  return (
    <>
      <ScrollDown theme="light" />
      <Hero />
      <How />
      <Video />
      <Values />
      <Separator image="/images/about/images11_about.jpg" />
      <Team />
      <Reason />

      <Newsletter />
    </>
  );
};

export default About;
