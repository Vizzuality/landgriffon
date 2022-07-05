import cx from 'classnames';

import Carousel from 'components/carousel';
import FadeIn from 'components/fade';
import Icon from 'components/icon';

import Wrapper from 'containers/wrapper';
import Link from 'next/link';
import { useState } from 'react';

import TESTIMONIALS_SVG from 'svgs/testimonials/icn_testimonials.svg?sprite';
import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';

const SLIDES = [
  {
    id: '1',
    content: (
      <div className="w-full">
        <div className="space-y-10">
          <p className="text-2xl text-white">
            With an estimated 80 - 90% of fashion&apos;s carbon emissions stemming from scope 3
            sources, the first step for brands is the ability to locate impacts. Transparency and
            visibility are more than buzzwords, they’re a necessity.
          </p>

          <p className="text-2xl text-white">
            We explore this need with LandGriffon, which allows companies to analyze these impacts
            and compare pathways towards sustainability.
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
            We&apos;re not only interested in better data, but the importance of pairing that with
            enhanced visualization software, to oversee environmental impacts in a granular, but
            manageable way. Analyzing this data paves the way to creating effective, data and
            science-backed strategies for improvement.
          </p>

          <p className="text-2xl text-white">
            That&apos;s why we believe so strongly in LandGriffon.
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
            Data is only as effective as the platform&apos;s usability. For systems as complex as
            supply chains, the sweet spot is software that presents the important information when
            it&apos;s needed and in a way that can be used for action, not overwhelm.
          </p>

          <p className="text-2xl text-white">
            This is what we&apos;re striving for with LandGriffon.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: '4',
    content: (
      <div className="w-full">
        <div className="space-y-10">
          <p className="text-2xl text-white">
            Let the platform do the work, so the people can focus on the essentials; decision
            making.
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
                  What is being said about LandGriffon
                </h2>
              </div>

              <div className="mt-5 md:mt-40">
                <Link href="/about">
                  <a className="flex items-center space-x-5 font-semibold text-orange-500">
                    <span>Know more about us</span>
                    <Icon icon={ARROW_RIGHT_SVG} className="w-12 h-12 fill-orange-500" />
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
                autoplay={10000}
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
