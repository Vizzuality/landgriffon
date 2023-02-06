import { ReactNode, useMemo } from 'react';

import { motion } from 'framer-motion';
import { useInView, IntersectionOptions } from 'react-intersection-observer';
export interface FadeInProps {
  children: ReactNode;
  className?: string;
  options?: IntersectionOptions;
}

const FadeIn: React.FC<FadeInProps> = ({ children, className, options }: FadeInProps) => {
  const { ref, inView } = useInView(options);

  const variants = useMemo(() => {
    return {
      hidden: {
        opacity: 0,
        transition: {
          duration: 0.5,
          delay: 0.1,
        },
      },

      visible: {
        opacity: 1,
        transition: {
          duration: 0.5,
          delay: 0.1,
        },
      },
    };
  }, []);

  const animate = useMemo(() => {
    if (inView) return 'visible';
    return 'hidden';
  }, [inView]);

  return (
    <motion.div
      className={className}
      ref={ref}
      initial="hidden"
      animate={animate}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
