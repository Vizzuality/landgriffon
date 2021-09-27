import Head from 'next/head';

import { motion } from 'framer-motion';

import Footer from 'containers/footer';
import Header from 'containers/header';
import Hero from 'containers/hero';
import MetaFooter from 'containers/meta-footer';
import Wrapper from 'containers/wrapper';

const Measure: React.FC = () => (
  <div>
    <Wrapper>
      <Head>
        <title>Measure</title>
      </Head>
      <Header />
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Hero
          title="Measure"
          subtitle="Map where your raw materials come from."
          description="Do you know all your farm locations or are you just starting out? No matter your level of value chain information, our accurate probabilistic sourcing model tells you where your materials are most likely to come from."
          imageURL="/images/measure/measure-map.jpg"
        />
      </motion.div>
      <MetaFooter />
      <Footer />
    </Wrapper>
  </div>
);

export default Measure;
