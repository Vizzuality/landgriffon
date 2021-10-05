import Head from 'next/head';

import { motion } from 'framer-motion';

import Content from 'containers/analyze/content';
import Footer from 'containers/footer';
import Header from 'containers/header';
import Hero from 'containers/hero';
import MetaFooter from 'containers/meta-footer';
import SubNav from 'containers/sub-nav';

const Analyze: React.FC = () => (
  <div>
    <Head>
      <title>Analyze</title>
    </Head>
    <Header />
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero
        title="Analyze"
        subtitle="See sources of impact and risk and understand what you can do about them."
        description="Track progress towards corporate targets or examine individual sources. What are your biggest sources of impacts? Which materials, suppliers, regions are at high risk?"
        imageURL="/images/analyze/analyze-1.jpg"
      />
      <Content />
    </motion.div>
    <SubNav type="analyze" />
    <MetaFooter />
    <Footer />
  </div>
);

export default Analyze;
