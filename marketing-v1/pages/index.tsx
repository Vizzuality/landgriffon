import Head from 'next/head';
import Image from 'next/image';

import { motion } from 'framer-motion';

import Footer from 'containers/footer';
import Header from 'containers/header';
import MetaFooter from 'containers/meta-footer';
import Wrapper from 'containers/wrapper';

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
            <h3 className="font-semibold underline cursor-pointer hover:no-underline">
              Sign up to know more about LandGriffon
            </h3>
          </div>
        </div>
      </section>

      <section className="pt-40 pb-20">
        <Wrapper>
          <h2 className="pb-12 text-5xl font-semibold text-green">Services</h2>
          <div className="flex items-center justify-between">
            <h3 className="w-4/6 text-7xl">Measure and manage supply chain impacts.</h3>
            <p className="w-2/6 text-xl">
              LandGriffon is a powerful modeling tool backed by a team of experts to empower you to
              change your business for the better.
            </p>
          </div>
        </Wrapper>
      </section>

      <section className="font-sans bg-bege">
        <Wrapper>
          <div className="flex justify-between space-x-64 p-28">
            <Image
              alt="plantation from the sky"
              height="942px"
              width="588px"
              src="/images/home/home-2.jpg"
            />
            <nav className="flex flex-col self-center h-full space-y-10">
              <div className="border-b border-black">
                <a className="text-5xl font-semibold underline" href="/measure">
                  01 Measure
                </a>
                <p className="text-xl py-9">
                  Turn procurement data into accurate estimates of environmental impacts.
                </p>
              </div>
              <div className="border-b border-black">
                <a className="text-5xl font-semibold underline" href="/analyze">
                  02 Analyze
                </a>
                <p className="text-xl py-9">
                  Identify where your supply chain impacts are and uncover the key drivers.{' '}
                </p>
              </div>
              <div className="border-b border-black">
                <a className="text-5xl font-semibold underline" href="/forecast">
                  03 Forecast
                </a>
                <p className="text-xl py-9">
                  Prioritize areas for change and plot a path to sustainability.
                </p>
              </div>
            </nav>
          </div>
        </Wrapper>
      </section>

      <section className="pt-40 pb-20">
        <Wrapper>
          <h2 className="pb-12 text-5xl font-semibold text-green">How it works</h2>
          <div className="flex items-center justify-between">
            <h3 className="text-6xl">
              LandGriffon works anywhere where you are on your journey in managing your supply
              chain.
            </h3>
          </div>
        </Wrapper>
      </section>

      <section className="pt-40 pb-20 bg-lightBlue">
        <Wrapper>
          <div className="flex items-center justify-between" />
        </Wrapper>
      </section>
    </motion.div>

    <MetaFooter />
    <Footer />
  </div>
);

export default Home;
