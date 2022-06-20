import React from 'react';

import Hero from 'containers/home/hero';
import What from 'containers/home/what';
import Features from 'containers/home/features';
import How from 'containers/home/how';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <What />
      <Features />
      <How />
    </>
  );
};

export default Home;
