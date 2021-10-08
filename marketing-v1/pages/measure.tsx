import Head from 'next/head';

import { motion } from 'framer-motion';

import Footer from 'containers/footer';
import Header from 'containers/header';
import Hero from 'containers/hero';
import Content from 'containers/measure/content';
import { Media } from 'containers/media';
import SubNav from 'containers/sub-nav';
import Subscribe from 'containers/subscribe';

const Measure: React.FC = () => (
  <div>
    <Head>
      <title>Measure</title>
    </Head>
    <Header />

    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Media lessThan="md">
        <Hero
          title="Measure"
          subtitle="Map where your raw materials come from."
          description="Do you know all your farm locations or are you just starting out? No matter your level of value chain information, our accurate probabilistic sourcing model tells you where your materials are most likely to come from."
          imageURL="/images/measure/measure-map-mb.jpg"
        />
      </Media>
      <Media greaterThanOrEqual="md">
        <Hero
          title="Measure"
          subtitle="Map where your raw materials come from."
          description="Do you know all your farm locations or are you just starting out? No matter your level of value chain information, our accurate probabilistic sourcing model tells you where your materials are most likely to come from."
          imageURL="/images/measure/measure-map.jpg"
        />
      </Media>
      <Content />
      <SubNav type="measure" />
      <Subscribe />
    </motion.div>

    <Footer />
  </div>
);

export default Measure;
