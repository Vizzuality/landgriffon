import Head from 'next/head';
import Image from 'next/image';

import { motion } from 'framer-motion';

import Footer from 'containers/footer';
import Header from 'containers/header';
import Features from 'containers/home/features';
import Services from 'containers/home/services';
import MetaFooter from 'containers/meta-footer';

const Home: React.FC = () => (
  <div>
    <Head>
      <title>Home</title>
    </Head>
    <Header />

    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="flex flex-col flex-grow w-full h-full row-auto pt-4 pb-5 mx-auto font-sans md:container">
        <div className="relative -mb-2">
          <Image
            alt="path in plantation"
            height="600px"
            width="1600px"
            src="/images/home/home-1.jpg"
          />
          <h2 className="absolute w-4/5 text-white bottom-16 left-16 text-7xl">
            Reach your supply chain sustainability targets
          </h2>
        </div>
        <div className="px-16 py-12 text-3xl text-white bg-green">
          <div className="w-2/4 space-y-8">
            <p>
              We help companies become sustainable by understanding and planning strategies to
              manage environmental impacts and risks in food supply chains.{' '}
            </p>
            <h3 className="underline cursor-pointer font-sans-semibold hover:no-underline">
              Sign up to know more about LandGriffon
            </h3>
          </div>
        </div>
      </section>
      <Services />
      <Features />
    </motion.div>

    <MetaFooter />
    <Footer />
  </div>
);

export default Home;
