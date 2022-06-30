import Wrapper from 'containers/wrapper';

import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section
      className="relative flex flex-col items-center justify-center h-screen bg-blue-600 bg-no-repeat bg-cover"
      style={{
        backgroundImage: `url('/images/home/hero/bg_circles.svg')`,
        backgroundPosition: '100% 50%',
      }}
    >
      <Wrapper>
        <div className="space-y-5">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
          >
            <h1 className="font-black text-white uppercase font-display text-10xl">
              Unlock the sustainability of your supply chain
            </h1>

            <div className="absolute bottom-0 right-0 w-7/12">
              <h2 className="max-w-md font-light text-white">
                LandGriffon empowers companies measure, manage, and transform agricultural supply
                chain impacts.
              </h2>
            </div>
          </motion.div>

          <motion.button
            className="py-5 font-semibold text-white border-2 border-white px-9"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
          >
            Set up a free call now
          </motion.button>
        </div>
      </Wrapper>
    </section>
  );
};

export default Hero;
