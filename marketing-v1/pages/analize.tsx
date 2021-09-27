import Head from 'next/head';

import { motion } from 'framer-motion';

import Footer from 'containers/footer';
import Header from 'containers/header';
import Hero from 'containers/hero';
import Wrapper from 'containers/wrapper';

const Analize: React.FC = () => (
  <div>
    <Wrapper>
      <Head>
        <title>Analize</title>
      </Head>
      <Header />
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Hero />
      </motion.div>
      <Footer />
    </Wrapper>
  </div>
);

export default Analize;
