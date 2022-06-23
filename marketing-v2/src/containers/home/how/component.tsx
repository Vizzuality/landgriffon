import cx from 'classnames';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';

import { useScrollPercentage } from 'react-scroll-percentage';
import { useMemo } from 'react';

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
    <section className="relative bg-white">
      <Wrapper>
        <div ref={ref} className="h-[400vh] relative">
          <div className="sticky top-0 flex items-center py-32 border-t border-black/10">
            <div className="space-y-20">
              <FadeIn>
                <h2 className="w-5/12 text-6xl font-black uppercase font-display">
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
                        'bg-orange-500': STEP === 0,
                      })}
                    >
                      <h3 className="text-xl font-black text-center uppercase font-display">
                        Import data
                      </h3>
                    </div>
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
                  </li>
                  <li>
                    <div
                      className={cx({
                        'flex items-center justify-center p-5 rounded-full w-52 h-52': true,
                        'transition-colors': true,
                        'bg-gray-100': STEP !== 3,
                        'bg-orange-500': STEP === 3,
                      })}
                    >
                      <h3 className="text-xl font-black text-center uppercase font-display">
                        EXPLORE PATHWAYS to reduce impacts
                      </h3>
                    </div>
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
