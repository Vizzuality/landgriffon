import Wrapper from 'containers/wrapper';

import { motion } from 'framer-motion';
import Link from 'next/link';

const Hero: React.FC = () => {
  return (
    <section className="relative flex flex-col items-center justify-center w-full py-12 overflow-hidden bg-blue-600 md:h-screen">
      <div className="absolute top-0 right-0 hidden w-[800px] h-[800px] bg-right-bottom bg-no-repeat pointer-events-none md:block">
        <object
          type="image/svg+xml"
          data="/images/home/hero/hero-animation.svg"
          width="800"
          height="900"
        />
      </div>
      <Wrapper>
        <div className="space-y-9">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
          >
            <h1 className="text-5xl font-black tracking-tight text-white uppercase font-display md:text-8xl lg:text-10xl">
              Unlock the sustainability of your supply chain
            </h1>

            <div className="bottom-0 right-0 mt-5 xl:absolute xl:w-7/12 xl:mt-0">
              <h2 className="max-w-md font-light text-white">
                LandGriffon empowers companies to measure, manage, and transform agricultural supply
                chain impacts.
              </h2>
            </div>
          </motion.div>

          <Link passHref href="/contact?topic=demo">
            <motion.a
              className="inline-block py-5 font-semibold text-white border-2 border-white px-9"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1 }}
            >
              Set up a free call now
            </motion.a>
          </Link>
        </div>
      </Wrapper>
    </section>
  );
};

export default Hero;
