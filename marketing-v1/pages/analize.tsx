import Head from 'next/head';

import { motion } from 'framer-motion';

import Footer from 'containers/footer';
import Header from 'containers/header';
import Hero from 'containers/hero';
import MetaFooter from 'containers/meta-footer';

const Analize: React.FC = () => (
  <div>
    <Head>
      <title>Analize</title>
    </Head>
    <Header />
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Hero
        title="Analize"
        subtitle="See sources of impact and risk and understand what you can do about them."
        description="Track progress towards corporate targets or examine individual sources. What are your biggest sources of impacts? Which materials, suppliers, regions are at high risk?"
        imageURL="/images/analize/analize-1.jpg"
      />
    </motion.div>
    <MetaFooter />
    <Footer />
  </div>
);

export default Analize;
