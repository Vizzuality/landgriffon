import Head from 'next/head';

import { motion } from 'framer-motion';

import Footer from 'containers/footer';
import Header from 'containers/header';
import MetaFooter from 'containers/meta-footer';
import Wrapper from 'containers/wrapper';

const Home: React.FC = () => (
  <div>
    <Wrapper>
      <Head>
        <title>Home</title>
      </Head>
      <Header />
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <h1 className="text-5xl font-heading md:text-7xl bg-orange">LANDGRIFFON.</h1>

        <div className="w-96">
          <p className="font-sans text-xl font-semibold bg-white">
            We help companies become sustainable by understanding and planning strategies to manage
            environmental impacts and risks in food supply chains.{' '}
          </p>
        </div>
      </motion.div>
      <MetaFooter />
      <Footer />
    </Wrapper>
  </div>
);

export default Home;
