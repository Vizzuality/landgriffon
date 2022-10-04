import Head from 'next/head';

import { motion } from 'framer-motion';

import Hero from 'containers/about/hero';
import TeamCarousel from 'containers/about/team-carousel';
import Values from 'containers/about/values';
import Footer from 'containers/footer';
import Header from 'containers/header';
import Subscribe from 'containers/subscribe';

const AboutUs: React.FC = () => (
  <div>
    <Head>
      <title>About Us - Landgriffon</title>
    </Head>
    <Header />
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Hero />
      <TeamCarousel />
      <Values />
      <Subscribe />
    </motion.div>
    <Footer />
  </div>
);

export default AboutUs;
