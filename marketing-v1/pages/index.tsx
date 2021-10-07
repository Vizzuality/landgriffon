import { useRef } from 'react';

import Head from 'next/head';

import { motion } from 'framer-motion';

import Footer from 'containers/footer';
import Header from 'containers/header';
import About from 'containers/home/about';
import Hero from 'containers/home/hero';
import Services from 'containers/home/services';
import Works from 'containers/home/works';
import SignUp from 'containers/sign-up';

const Home: React.FC = () => {
  const scrollToRef = useRef(null);
  const executeScroll = () =>
    scrollToRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>
      <Header />

      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Hero onSignUp={executeScroll} />
        <Services />
        <Works />
        <About />
      </motion.div>

      <div ref={scrollToRef}>
        <SignUp />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
