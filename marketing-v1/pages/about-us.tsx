import Head from 'next/head';

import { motion } from 'framer-motion';

import Hero from 'containers/about/hero';
import TeamCarousel from 'containers/about/team-carousel';
import Values from 'containers/about/values';
import Footer from 'containers/footer';
import Header from 'containers/header';
import SignUp from 'containers/sign-up';

const AboutUs: React.FC = () => (
  <div>
    <Head>
      <title>About Us</title>
    </Head>
    <Header />
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Hero />
      <TeamCarousel />
      <Values />
    </motion.div>
    <SignUp />
    <Footer />
  </div>
);

export default AboutUs;
