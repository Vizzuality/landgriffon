import Head from 'next/head';

import { motion } from 'framer-motion';

import Footer from 'containers/footer';
import Content from 'containers/forecast/content';
import Header from 'containers/header';
import Hero from 'containers/hero';
import SignUp from 'containers/sign-up';
import SubNav from 'containers/sub-nav';

const Forecast: React.FC = () => (
  <div>
    <Head>
      <title>Forecast</title>
    </Head>
    <Header />
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Hero
        title="Forecast"
        subtitle="Make informed decisions on buying raw materials."
        description="Simulate scenarios of of how your company’s procurement will change over time. Evaluate options for improvement and prioritize areas for intervention."
        imageURL="/images/forecast/forecast-1.jpg"
      />
      <Content />
      <SubNav type="forecast" />
    </motion.div>
    <SignUp />
    <Footer />
  </div>
);

export default Forecast;
