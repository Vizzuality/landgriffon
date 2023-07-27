import Wrapper from 'containers/wrapper';

import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="relative z-10 bg-white">
      <Wrapper>
        <motion.div
          className="relative pt-12 md:pt-32 md:pb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
        >
          <h1 className="text-5xl font-black text-black uppercase font-display md:text-7xl">
            We help you transform your supply chain for the better, using{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-green-500 to-blue-600">
              four key steps.
            </span>
          </h1>
        </motion.div>

        <div className="flex space-x-2 translate-y-16 md:space-x-6">
          <motion.iframe
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            width="853"
            height="480"
            src="https://www.youtube.com/embed/RIJ1lX57TtI"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Landgriffon: Sustainable Supply Chain Solutions"
            className="w-full h-[190px] md:h-[438px] lg:h-[603px]"
          />
        </div>
      </Wrapper>
    </section>
  );
};

export default Hero;
