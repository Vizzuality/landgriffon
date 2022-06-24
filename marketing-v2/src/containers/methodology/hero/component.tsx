import Wrapper from 'containers/wrapper';

import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="relative z-10 bg-white">
      <Wrapper>
        <motion.div
          className="relative pt-64 pb-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
        >
          <h1 className="font-black text-black uppercase font-display text-7xl">
            We use world-renowned datasets to analyze impacts.
          </h1>
        </motion.div>
      </Wrapper>
    </section>
  );
};

export default Hero;
