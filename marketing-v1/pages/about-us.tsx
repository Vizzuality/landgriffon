import Head from 'next/head';

import { motion } from 'framer-motion';

import AboutHero from 'containers/about/hero';
import TeamCarousel from 'containers/about/team-carousel';
import Footer from 'containers/footer';
import Header from 'containers/header';
import Wrapper from 'containers/wrapper';

const AboutUs: React.FC = () => (
  <div>
    <Wrapper>
      <Head>
        <title>About Us</title>
      </Head>
      <Header />
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <AboutHero />
        <TeamCarousel />
      </motion.div>
      <Footer />
    </Wrapper>
  </div>
);

export default AboutUs;
