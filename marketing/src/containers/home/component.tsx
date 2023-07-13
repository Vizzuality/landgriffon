import React from 'react';

import Hero from 'containers/home/hero';
import What from 'containers/home/what';
import Features from 'containers/home/features';
import How from 'containers/home/how';
import Developed from 'containers/home/developed';
import Newsletter from 'containers/newsletter';
import ScrollDown from 'containers/scroll-down';
import BlogPosts from 'containers/blog-posts';

const Home: React.FC = () => {
  return (
    <>
      <ScrollDown theme="dark" />
      <Hero />
      <What />
      <Features />
      <How />
      <Developed />
      <BlogPosts />
      <Newsletter />
    </>
  );
};

export default Home;
