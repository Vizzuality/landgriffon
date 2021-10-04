import Head from 'next/head';

import { motion } from 'framer-motion';

import Footer from 'containers/footer';
import Header from 'containers/header';
import Features from 'containers/home/features';
import Hero from 'containers/home/hero';
import Services from 'containers/home/services';
import MetaFooter from 'containers/meta-footer';

const Home: React.FC = () => (
  <div>
    <Head>
      <title>Home</title>
    </Head>
    <Header />

    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Hero />
      <Services />
      <Features />
    </motion.div>

    <MetaFooter />
    <Footer />
  </div>
);

export default Home;
