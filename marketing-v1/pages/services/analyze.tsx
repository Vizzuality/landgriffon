import Head from 'next/head';

import { motion } from 'framer-motion';

import Content from 'containers/analyze/content';
import Footer from 'containers/footer';
import Header from 'containers/header';
import ServicesTabNav from 'containers/services-tab-nav';
import SubNav from 'containers/sub-nav';
import Subscribe from 'containers/subscribe';

const Analyze: React.FC = () => (
  <div>
    <Head>
      <title>Analyze - Landgriffon</title>
    </Head>
    <Header />

    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <ServicesTabNav
        title="Analyze"
        subtitle="See sources of impact and risk and understand what you can do about them."
        description="Track progress towards corporate targets or examine individual sources. What are your biggest sources of impacts? Which materials, suppliers, regions are at high risk?"
        imageURL="/images/analyze/analyze-1.jpg"
      />
      <Content />
      <SubNav type="analyze" />
      <Subscribe />
    </motion.div>

    <Footer />
  </div>
);

export default Analyze;
