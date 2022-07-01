import cx from 'classnames';

import Wrapper from 'containers/wrapper';
import FadeIn from 'components/fade';
import Carousel from 'components/carousel';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/solid';
import { useMemo, useState } from 'react';

const SLIDES = [
  {
    id: '1',
    content: (
      <div
        className="w-full border-4 border-white pb-[45%] bg-cover"
        style={{ backgroundImage: `url('/images/home/what/screen_1.jpg')` }}
      />
    ),
    description: (
      <div className="text-xl text-white">
        <p>
          <span className="text-orange-500">Analyze and manage</span> impacts across your entire
          supply chain.
        </p>
      </div>
    ),
  },
  {
    id: '2',
    content: (
      <div
        className="w-full border-4 border-white pb-[45%] bg-cover"
        style={{ backgroundImage: `url('/images/home/what/screen_2.jpg')` }}
      />
    ),
    description: (
      <div className="text-xl text-white">
        <p>
          <span className="text-orange-500">Locate the critical areas</span> for action to help you
          meet your sustainability targets.
        </p>
      </div>
    ),
  },
  {
    id: '3',
    content: (
      <div
        className="w-full border-4 border-white pb-[45%] bg-cover"
        style={{ backgroundImage: `url('/images/home/what/screen_3.jpg')` }}
      />
    ),
    description: (
      <div className="text-xl text-white">
        <p>
          Compare strategies using our forecasting tool to
          <span className="text-orange-500"> determine the best path forward.</span>
        </p>
      </div>
    ),
  },
];

const What: React.FC = () => {
  const [slide, setSlide] = useState(0);

  const DESCRIPTION = useMemo(() => {
    return SLIDES[slide]?.description;
  }, [slide]);

  return (
    <section className="relative pt-12 pb-24 bg-blue-600 md:pt-32 md:pb-64">
      <div className="relative z-10">
        <Wrapper>
          <div className="flex flex-col space-y-5 md:flex-row md:space-y-0 md:justify-between">
            <div className="md:w-5/12">
              <FadeIn>
                <div>
                  <h2 className="text-4xl font-black text-white uppercase md:text-6xl font-display">
                    What can Landgriffon do for you?
                  </h2>
                </div>
              </FadeIn>
            </div>
            <div className="md:w-5/12">
              <FadeIn>
                <div className="space-y-5">
                  <div className="flex items-center space-x-2">
                    <div className="text-xl font-black text-white">{`0${slide + 1}`}</div>
                    <div className="w-5 h-px bg-gray-300 opacity-30" />
                    <div className="text-xl font-black text-gray-300 opacity-30">{`03`}</div>
                  </div>
                  <div className="max-w-[275px]">{DESCRIPTION}</div>
                </div>

                <div className="hidden mt-10 space-x-1 md:flex">
                  <button
                    type="button"
                    onClick={() => {
                      const s = slide - 1 < 0 ? SLIDES.length - 1 : slide - 1;
                      setSlide(s);
                    }}
                    className="flex items-center justify-center border border-white w-11 h-11"
                  >
                    <ArrowLeftIcon className="w-5 h-5 text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const s = slide + 1 > SLIDES.length - 1 ? 0 : slide + 1;
                      setSlide(s);
                    }}
                    className="flex items-center justify-center border border-white w-11 h-11"
                  >
                    <ArrowRightIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
              </FadeIn>
            </div>
          </div>
        </Wrapper>
      </div>

      {/* CARAOUSEL */}
      <div className="relative z-10 mt-5 md:mt-20">
        <Wrapper>
          <FadeIn>
            <div className="flex flex-row items-center justify-center py-5 space-x-1">
              {SLIDES.map((sl, i) => {
                return (
                  <button
                    key={sl.id}
                    type="button"
                    aria-label="dot-element"
                    onClick={() => {
                      setSlide(i);
                    }}
                    className={cx({
                      'relative w-20': true,
                      'bg-orange-500 h-1': slide === i,
                      'bg-gray-300 h-0.5 opacity-30': slide !== i,
                    })}
                  >
                    <div className="absolute left-0 w-full h-3 transform -translate-y-1/2 bg-transparent top-1/2" />
                  </button>
                );
              })}
            </div>

            <Carousel
              slide={slide}
              slides={SLIDES}
              onChange={(i) => {
                setSlide(i);
              }}
              autoplay
            />
          </FadeIn>
        </Wrapper>
      </div>
      <div
        className="absolute bottom-0 left-0 z-0 w-full bg-cover h-1/4 md:h-1/2"
        style={{ backgroundImage: `url('/images/home/what/image1_landing.jpg')` }}
      />
    </section>
  );
};

export default What;
