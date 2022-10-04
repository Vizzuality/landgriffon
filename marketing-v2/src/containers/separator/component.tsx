import { useScrollPercentage } from 'react-scroll-percentage';

import { motion } from 'framer-motion';

interface SeparatorProps {
  image: string;
}

const Separator: React.FC<SeparatorProps> = ({ image }: SeparatorProps) => {
  const [ref, percentage] = useScrollPercentage({
    threshold: 0,
  });

  return (
    <section ref={ref} className="relative z-0 h-[50vh] overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 w-full h-[125%] bg-center bg-cover"
        animate={{
          y: `${percentage * -20}%`,
        }}
        transition={{
          duration: 0.01,
        }}
        style={{
          backgroundImage: `url(${image})`,
        }}
      />
    </section>
  );
};

export default Separator;
