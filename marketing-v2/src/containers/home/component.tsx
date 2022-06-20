import React from 'react';

import Hero from 'containers/home/hero';
import Features from 'containers/home/features';
import How from 'containers/home/how';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Features />
      <How />
    </>
  );
};

export default Home;
