import { FC, useState } from 'react';
import FadeIn from 'components/fade';

import Wrapper from 'containers/wrapper';
import Carousel from 'components/carousel/component';
import Link from 'next/link';
import Icon from 'components/icon';

import ARROW_SVG from 'svgs/ui/arrow-top-right.svg?sprite';

import { SLIDES } from './slides';

const DiscoverOurJourney: FC = () => {
  const [slide, setSlide] = useState(0);
  return (
    <section className="relative py-12 space-y-12 bg-blue-600 bg-cover md:space-y-64 md:py-36 overflow-hidden text-white">
      <Wrapper>
        <FadeIn>
          <div className="space-y-10 pb-20">
            <div className="space-y-11">
              <div className="flex justify-between items-center border-t border-t-[#1D3786] pt-2">
                <h2 className="text-xl font-black uppercase font-display max-w-lg">
                  Discover our journey
                </h2>
                <Link href="/contact">
                  <a className="flex space-x-4 text-orange-500 font-semibold">
                    <span>Discover more about us</span>
                    <Icon icon={ARROW_SVG} className="w-4 h-4 rotate-12" />
                  </a>
                </Link>
              </div>

              <div>
                <Carousel
                  slide={slide}
                  slides={SLIDES}
                  onChange={(i) => {
                    setSlide(i);
                  }}
                  autoplay={10000}
                  options={{
                    duration: 0,
                    circular: true,
                  }}
                />

                <div className="flex justify-center py-5 mt-10 space-x-5">
                  {SLIDES.map((sl, i) => {
                    return (
                      <button
                        key={sl.id}
                        type="button"
                        aria-label="dot-element"
                        onClick={() => {
                          setSlide(i);
                        }}
                        className="relative w-2.5 h-2.5 rounded-full border-2 border-white"
                      >
                        {slide === i && (
                          <div className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 bg-orange-400 rounded-full left-1/2 top-1/2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </Wrapper>
    </section>
  );
};

export default DiscoverOurJourney;
