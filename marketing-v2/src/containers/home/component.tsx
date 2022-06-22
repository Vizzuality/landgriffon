import React from 'react';

import Hero from 'containers/home/hero';
import What from 'containers/home/what';
import Features from 'containers/home/features';
import How from 'containers/home/how';
import Developed from 'containers/home/developed';
import Newsletter from 'containers/newsletter';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <What />
      <Features />
      <How />
      <Developed />
      <Newsletter />
    </>
  );
};

export default Home;
