import { useMemo } from 'react';
import cx from 'classnames';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import Image from 'next/image';
import { useScrollPercentage } from 'react-scroll-percentage';

const AppScreens: React.FC = () => {
  const { ref: highlightRef, inView } = useInView();

  const [ref, percentage] = useScrollPercentage();

  const animate = useMemo(() => {
    if (inView) return 'animate';
    return 'initial';
  }, [inView]);

  return (
    <section ref={ref} className="relative py-32 bg-orange-500 h-[75vh]">
      <div className="w-full min-w-[1000px] h-full absolute top-0 left-1/2 -translate-x-1/2">
        <motion.div
          className="w-full h-full"
          animate={{
            y: `${percentage * -20 + 20}%`,
          }}
          transition={{
            duration: 0.01,
            ease: 'linear',
          }}
        >
          <div
            className={cx({
              'flex flex-wrap gap-10 justify-center rotate-[-30deg] origin-center': true,
            })}
          >
            <div className="w-[calc(33.33%_-_40px)]">
              <Image
                alt="Screen 01"
                src="/images/service/example/01.png"
                width={1005}
                height={714}
                layout="responsive"
              />
            </div>

            <motion.div
              ref={highlightRef}
              className="w-[calc(33.33%_-_40px)]"
              initial="initial"
              animate={animate}
              variants={{
                initial: {
                  opacity: 0.8,
                  y: 0,
                  boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0.5)',
                  transition: {
                    duration: 0.5,
                    delay: 0.1,
                  },
                },
                animate: {
                  opacity: 1,
                  y: -20,
                  boxShadow: '0 0 100px 0px rgba(0, 0, 0, 0.5)',
                  transition: {
                    duration: 0.5,
                    delay: 0.1,
                  },
                },
              }}
            >
              <Image
                alt="Screen 02"
                src="/images/service/example/02.png"
                width={1005}
                height={714}
                layout="responsive"
              />
            </motion.div>
            <div className="w-[calc(33.33%_-_40px)] opacity-30">
              <Image
                alt="Screen 03"
                src="/images/service/example/03.png"
                width={1005}
                height={714}
                layout="responsive"
              />
            </div>
            <div className="w-[calc(33.33%_-_40px)] opacity-20">
              <Image
                alt="Screen 04"
                src="/images/service/example/04.png"
                width={1005}
                height={714}
                layout="responsive"
              />
            </div>
            <div className="w-[calc(33.33%_-_40px)] opacity-20">
              <Image
                alt="Screen 05"
                src="/images/service/example/05.png"
                width={1005}
                height={714}
                layout="responsive"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AppScreens;
