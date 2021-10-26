import Head from 'next/head';

import { motion } from 'framer-motion';

import Footer from 'containers/footer';
import Content from 'containers/forecast/content';
import Header from 'containers/header';
import ServicesTabNav from 'containers/services-tab-nav';
import SubNav from 'containers/sub-nav';
import Subscribe from 'containers/subscribe';

const Forecast: React.FC = () => (
  <div>
    <Head>
      <title>Forecast - Landgriffon</title>
    </Head>
    <Header />

    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <ServicesTabNav
        title="Forecast"
        subtitle="Make informed decisions on buying raw materials."
        description="Simulate scenarios of how your company’s procurement will change over time. Evaluate options for improvement and prioritize areas for intervention."
        imageURL="/images/forecast/forecast-1.jpg"
      />
      <Content />
      <SubNav type="forecast" />
      <Subscribe />
    </motion.div>

    <Footer />
  </div>
);

export default Forecast;
