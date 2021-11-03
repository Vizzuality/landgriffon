import { useRef } from 'react';

import Head from 'next/head';

import { motion } from 'framer-motion';

import Footer from 'containers/footer';
import Header from 'containers/header';
import About from 'containers/home/about';
import BlogArticles from 'containers/home/blog-articles';
import Hero from 'containers/home/hero';
import Services from 'containers/home/services';
import Works from 'containers/home/works';
import Subscribe from 'containers/subscribe';

const Home: React.FC = () => {
  const subscribeScrollRef = useRef(null);

  const scrollToSection = (ref) =>
    ref.current.scrollIntoView({ block: 'center', behavior: 'smooth' });

  return (
    <div>
      <Head>
        <title>Welcome - Landgriffon</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Hero onSignUp={() => scrollToSection(subscribeScrollRef)} />
        <Services />
        <Works />
        <About />
        <BlogArticles />
        <div ref={subscribeScrollRef}>
          <Subscribe />
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Home;
