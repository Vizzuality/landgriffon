import { ReactNode, useMemo } from 'react';

import { motion } from 'framer-motion';
import { useInView, IntersectionOptions } from 'react-intersection-observer';
export interface ScaleInProps {
  children: ReactNode;
  className?: string;
  options?: IntersectionOptions;
}

const ScaleIn: React.FC<ScaleInProps> = ({ children, className, options }: ScaleInProps) => {
  const { ref, inView } = useInView(options);

  const variants = useMemo(() => {
    return {
      hidden: {
        scale: 0.75,
        transition: {
          duration: 0.5,
          delay: 0.25,
        },
      },

      visible: {
        scale: 1,
        transition: {
          duration: 0.5,
          delay: 0.25,
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

export default ScaleIn;
