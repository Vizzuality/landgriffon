import React from 'react';

import { Scroll } from 'scrollex';

import Hero from 'containers/home/hero';

const Home: React.FC = () => {
  return (
    <Scroll.Container scrollAxis="y" className="h-screen">
      <Hero />
    </Scroll.Container>
  );
};

export default Home;
