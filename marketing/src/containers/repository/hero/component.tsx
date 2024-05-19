import Wrapper from 'containers/wrapper';

import { motion } from 'framer-motion';

const Hero: React.FC = () => (
  <section className="relative z-10 bg-white">
    <Wrapper>
      <motion.div
        className="relative py-12 md:py-32"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.1 }}
      >
        <div className="space-y-10 xl:col-span-full col-span-2">
          <h1 className="text-5xl font-black text-black uppercase font-display lg:text-7xl">
            Knowledge Repository
          </h1>
          <h2 className="text-2xl font-medium text-black font-display md:text-3xl">
            At LandGriffon, we&apos;re dedicated to driving sustainability through science. Explore
            our repository for insights, methodologies, and datasets shaping environmental impact
            assessment and resource management.
          </h2>
        </div>
      </motion.div>
    </Wrapper>
  </section>
);

export default Hero;
