import Wrapper from 'containers/wrapper';

import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="relative z-10 bg-white">
      <Wrapper>
        <motion.div
          className="relative pt-32 pb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
        >
          <h1 className="font-black text-black uppercase font-display text-7xl">
            We help you transform your supply chain for the better, using{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-green-500 to-blue-600">
              six key steps.
            </span>
          </h1>
        </motion.div>

        <div className="flex space-x-6 translate-y-16">
          <motion.div
            className="relative w-5/12 h-[460px] bg-cover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            style={{
              backgroundImage: `url('/images/service/hero/image3_service.jpg')`,
              // y: 20 * percentage,
            }}
          />
          <motion.div
            className="relative w-4/12 h-[460px] bg-cover mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            style={{
              backgroundImage: `url('/images/service/hero/image4_service.jpg')`,
              // y: 50 * percentage,
            }}
          />
          <motion.div
            className="relative w-4/12 h-[460px] bg-cover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            style={{
              backgroundImage: `url('/images/service/hero/image5_service.jpg')`,
              // y: 20 * percentage,
            }}
          />
        </div>
      </Wrapper>
    </section>
  );
};

export default Hero;
