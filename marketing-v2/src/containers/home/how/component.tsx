import { useMemo } from 'react';
import cx from 'classnames';

import { motion } from 'framer-motion';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

import { useScrollPercentage } from 'react-scroll-percentage';

import {
  IMPORT_DATA_FEATURES,
  MAP_SUPPLIERS_FEATURES,
  CALCULATE_IMPACT_FEATURES,
  EXPLORE_FEATURES,
} from 'containers/home/how/constants';
import Icon from 'components/icon';

const How: React.FC = () => {
  const [ref, percentage] = useScrollPercentage({
    threshold: 0,
  });

  const STEP = useMemo(() => {
    const step = 0.6 / 4;
    if (percentage < 0.2 + step) return 0;
    if (percentage < 0.2 + step * 2) return 1;
    if (percentage < 0.2 + step * 3) return 2;
    return 3;
  }, [percentage]);

  return (
    <section className="relative hidden bg-white md:block">
      <Wrapper>
        <div ref={ref} className="h-[400vh] relative">
          <div className="sticky top-0 flex items-center py-32 border-t border-black/10">
            <div className="space-y-20">
              <FadeIn>
                <h2 className="w-5/12 text-4xl font-black uppercase md:text-6xl font-display">
                  How does it work?
                </h2>
              </FadeIn>

              <FadeIn>
                <ul className="grid grid-cols-4 gap-x-20">
                  <li>
                    <div
                      className={cx({
                        'flex items-center justify-center p-5 rounded-full w-52 h-52': true,
                        'transition-colors': true,
                        'bg-gray-100': STEP !== 0,
                        'bg-orange-500 ': STEP === 0,
                      })}
                    >
                      <h3 className="text-xl font-black text-center uppercase font-display">
                        Import data
                      </h3>
                    </div>

                    <motion.ul
                      initial={{ opacity: 0 }}
                      animate={{ opacity: STEP === 0 ? 1 : 0 }}
                      className="mt-10 space-y-5"
                    >
                      {IMPORT_DATA_FEATURES.map((feature) => (
                        <li key={feature.id} className="flex items-center space-x-2">
                          <div className="flex items-center justify-center bg-orange-500 rounded-full shrink-0 w-9 h-9">
                            <Icon icon={feature.icon} className="w-3.5 h-3.5 fill-black" />
                          </div>
                          <p className="font-light">{feature.name}</p>
                        </li>
                      ))}
                    </motion.ul>
                  </li>
                  <li>
                    <div
                      className={cx({
                        'flex items-center justify-center p-5 rounded-full w-52 h-52': true,
                        'transition-colors': true,
                        'bg-gray-100': STEP !== 1,
                        'bg-green-500 text-white': STEP === 1,
                      })}
                    >
                      <h3 className="text-xl font-black text-center uppercase font-display">
                        Map suppliers
                      </h3>
                    </div>

                    <motion.ul
                      initial={{ opacity: 0 }}
                      animate={{ opacity: STEP === 1 ? 1 : 0 }}
                      className="mt-10 space-y-5"
                    >
                      {MAP_SUPPLIERS_FEATURES.map((feature) => (
                        <li key={feature.id} className="flex items-center space-x-2">
                          <div className="flex items-center justify-center bg-green-500 rounded-full shrink-0 w-9 h-9">
                            <Icon icon={feature.icon} className="w-3.5 h-3.5 fill-white" />
                          </div>
                          <p className="font-light">{feature.name}</p>
                        </li>
                      ))}
                    </motion.ul>
                  </li>
                  <li>
                    <div
                      className={cx({
                        'flex items-center justify-center p-5 rounded-full w-52 h-52': true,
                        'transition-colors': true,
                        'bg-gray-100': STEP !== 2,
                        'bg-green-500 text-white': STEP === 2,
                      })}
                    >
                      <h3 className="text-xl font-black text-center uppercase font-display">
                        Calculate impact
                      </h3>
                    </div>

                    <motion.ul
                      initial={{ opacity: 0 }}
                      animate={{ opacity: STEP === 2 ? 1 : 0 }}
                      className="mt-10 space-y-5"
                    >
                      {CALCULATE_IMPACT_FEATURES.map((feature) => (
                        <li key={feature.id} className="flex items-center space-x-2">
                          <div className="flex items-center justify-center bg-green-500 rounded-full shrink-0 w-9 h-9">
                            <Icon icon={feature.icon} className="w-3.5 h-3.5 fill-white" />
                          </div>
                          <p className="font-light">{feature.name}</p>
                        </li>
                      ))}
                    </motion.ul>
                  </li>
                  <li>
                    <div
                      className={cx({
                        'flex items-center justify-center p-5 rounded-full w-52 h-52': true,
                        'transition-colors': true,
                        'bg-gray-100': STEP !== 3,
                        'bg-blue-500 text-white': STEP === 3,
                      })}
                    >
                      <h3 className="text-xl font-black text-center uppercase font-display">
                        EXPLORE PATHWAYS to reduce impacts
                      </h3>
                    </div>

                    <motion.ul
                      initial={{ opacity: 0 }}
                      animate={{ opacity: STEP === 3 ? 1 : 0 }}
                      className="mt-10 space-y-5"
                    >
                      {EXPLORE_FEATURES.map((feature) => (
                        <li key={feature.id} className="flex items-center space-x-2">
                          <div className="flex items-center justify-center bg-blue-500 rounded-full shrink-0 w-9 h-9">
                            <Icon icon={feature.icon} className="w-3.5 h-3.5 fill-white" />
                          </div>
                          <p className="font-light">{feature.name}</p>
                        </li>
                      ))}
                    </motion.ul>
                  </li>
                </ul>
              </FadeIn>
            </div>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default How;
