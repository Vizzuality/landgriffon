import { FC, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { motion } from 'framer-motion';

import Carousel from 'components/carousel/component';
import FadeIn from 'components/fade';
import Icon from 'components/icon';
import Wrapper from 'containers/wrapper';

import cx from 'classnames';

import ARROW_SVG from 'svgs/ui/arrow-right.svg?sprite';

import { SLIDES } from './slides';

const DiscoverOurJourney: FC = () => {
  const [slide, setSlide] = useState(0);

  return (
    <section className="relative py-12 space-y-12 bg-blue-600 bg-cover md:space-y-64 md:py-36 overflow-hidden text-white">
      <Wrapper>
        <Image
          src="/images/repository/decoration.svg"
          alt="Landgriffon"
          width={79.61}
          height={70}
          priority
        />
        <motion.div
          className="relative py-12 md:py-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
        >
          <h2 className="text-4xl font-black uppercase md:text-6xl font-display">
            DISCOVER MORE, READ OUR BLOGS
          </h2>
        </motion.div>
        <FadeIn>
          <div className="space-y-10 pb-20">
            <div className="space-y-11">
              <div className="flex justify-between items-center border-t border-t-[#1D3786] pt-2">
                <h2 className="text-xl font-black uppercase font-display max-w-lg">
                  Discover our journey
                </h2>
                <Link href="/contact">
                  <a
                    className="flex space-x-4 text-orange-500 font-semibold items-center cursor-pointer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Discover more about us</span>
                    <Icon icon={ARROW_SVG} className="w-4 h-4 fill-orange-500 -rotate-45" />
                  </a>
                </Link>
              </div>

              <div className="w-full">
                <Carousel
                  slide={slide}
                  slides={SLIDES}
                  onChange={(i) => {
                    setSlide(i);
                  }}
                  autoplay={0}
                  options={{
                    duration: 0,
                    circular: false,
                    align: 'prev',
                  }}
                />

                <div className="flex justify-center py-5 mt-10 space-x-5 items-center">
                  <button
                    type="button"
                    aria-label="dot-element"
                    onClick={() => {
                      setSlide(slide - 1);
                    }}
                    disabled={slide === 0}
                    className="relative text-orange-500"
                  >
                    <Icon
                      icon={ARROW_SVG}
                      className={cx({
                        'w-6 h-6 rotate-180 font-bold fill-orange-500 stroke-2': true,
                        'opacity-50': slide === 0,
                      })}
                    />
                  </button>
                  {SLIDES.map((sl, i) => {
                    return (
                      <button
                        key={sl.id}
                        type="button"
                        aria-label="dot-element"
                        disabled={slide === i}
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
                  <button
                    type="button"
                    aria-label="dot-element"
                    onClick={() => {
                      setSlide(slide + 1);
                    }}
                    disabled={slide === SLIDES.length - 1}
                    className={cx({
                      'w-6 h-6 rotate-180 font-bold fill-orange-500 stroke-2': true,
                      'opacity-50': slide === SLIDES.length - 1,
                    })}
                  >
                    <Icon
                      icon={ARROW_SVG}
                      className="w-6 h-6 font-bold fill-orange-500 stroke-2 rotate-180"
                    />
                  </button>
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
