import { ArrowRightIcon } from '@heroicons/react/solid';
import cx from 'classnames';

import Carousel from 'components/carousel';
import FadeIn from 'components/fade';
import Icon from 'components/icon';

import Wrapper from 'containers/wrapper';
import Link from 'next/link';
import { useState } from 'react';

import TESTIMONIALS_SVG from 'svgs/testimonials/icn_testimonials.svg?sprite';

const SLIDES = [
  {
    id: '1',
    content: (
      <div className="w-full">
        <div className="space-y-10">
          <p className="text-2xl text-white">
            The impacts from agriculture are embedded in a complex web of producers, suppliers, and
            distributors. How do we bring the right solutions to those who can bring change?
          </p>

          <p className="text-2xl text-white">
            Share #LandGriffon. Help us connect with those who have the power to make major
            differences #FoodCorporations
          </p>
        </div>
      </div>
    ),
  },
  {
    id: '2',
    content: (
      <div className="w-full">
        <div className="space-y-10">
          <p className="text-2xl text-white">
            The impacts from agriculture are embedded in a complex web of producers, suppliers, and
            distributors. How do we bring the right solutions to those who can bring change?
          </p>

          <p className="text-2xl text-white">
            Share #LandGriffon. Help us connect with those who have the power to make major
            differences #FoodCorporations
          </p>
        </div>
      </div>
    ),
  },
  {
    id: '3',
    content: (
      <div className="w-full">
        <div className="space-y-10">
          <p className="text-2xl text-white">
            The impacts from agriculture are embedded in a complex web of producers, suppliers, and
            distributors. How do we bring the right solutions to those who can bring change?
          </p>

          <p className="text-2xl text-white">
            Share #LandGriffon. Help us connect with those who have the power to make major
            differences #FoodCorporations
          </p>
        </div>
      </div>
    ),
  },
];

const Testimonials: React.FC = () => {
  const [slide, setSlide] = useState(0);

  return (
    <section className="relative py-12 bg-blue-600 md:py-32">
      <Wrapper>
        <div className="flex-col space-y-10 md:flex-row md:justify-between md:flex md:space-y-0">
          <div className="md:w-5/12">
            <FadeIn>
              <div className="space-y-5 md:space-y-20">
                <Icon icon={TESTIMONIALS_SVG} className="w-14 h-14 md:w-24 md:h-24" />

                <h2 className="text-4xl font-black text-white uppercase md:text-6xl font-display">
                  WHAT OUR CLIENTS THINK OF US
                </h2>
              </div>

              <div className="mt-5 md:mt-40">
                <Link href="/about">
                  <a className="font-semibold text-orange-500 flex space-x-2.5 items-center">
                    <span>Know more about us</span>
                    <ArrowRightIcon className="w-10 h-10" />
                  </a>
                </Link>
              </div>
            </FadeIn>
          </div>

          <div className="md:w-5/12">
            <FadeIn>
              <Carousel
                slide={slide}
                slides={SLIDES}
                onChange={(i) => {
                  setSlide(i);
                }}
                autoplay
                options={{
                  duration: 0,
                  circular: true,
                }}
              />

              <div className="flex py-5 mt-10 space-x-5">
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
                        'relative w-2.5 h-2.5 rounded-full border-2 border-white': true,
                      })}
                    >
                      {slide === i && (
                        <div className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500 rounded-full left-1/2 top-1/2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </FadeIn>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default Testimonials;
