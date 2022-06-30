import Wrapper from 'containers/wrapper';

import { motion } from 'framer-motion';
import Image from 'next/image';

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-white">
      <Wrapper>
        <motion.div
          className="relative pt-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
        >
          <div className="flex flex-col space-y-20 lg:flex-row lg:justify-between lg:space-x-20 lg:space-y-0">
            <div className="space-y-20 lg:w-7/12">
              <h1 className="font-black text-black uppercase font-display text-7xl">
                We are on a mission to make supply chains more sustainable.
              </h1>

              <button className="py-5 font-semibold text-black border-2 border-black px-9">
                Set up a free call now
              </button>
            </div>

            <div className="relative z-20 lg:w-5/12">
              <div className="space-y-5">
                <div>
                  <Image
                    priority
                    src="/images/about/hero/01.jpg"
                    width={1212 / 2}
                    height={850 / 2}
                    alt="About 01"
                    layout="fixed"
                  />
                </div>
                <div>
                  <Image
                    priority
                    src="/images/about/hero/02.jpg"
                    width={972 / 2}
                    height={666 / 2}
                    alt="About 02"
                    layout="fixed"
                  />
                </div>
                <div className="absolute hidden m-0 -translate-x-5 bottom-28 lg:block right-full">
                  <Image
                    priority
                    src="/images/about/hero/03.jpg"
                    width={360 / 2}
                    height={498 / 2}
                    alt="About 03"
                    layout="fixed"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Wrapper>
    </section>
  );
};

export default Hero;
