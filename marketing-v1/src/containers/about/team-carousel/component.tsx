import React, { useState, useRef, useCallback } from 'react';

import Slider from 'react-slick';

import Image from 'next/image';

import { motion, AnimatePresence } from 'framer-motion';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

import ARROW_PREVIOUS_SVG from 'svgs/arrow-left.svg';
import ARROW_NEXT_SVG from 'svgs/arrow-right.svg';

import Card from './card';
import TEAM from './constants';

export interface ArrowProps {
  onClick?: () => void;
}

type ResponsiveBreakPoint = {
  breakpoint: number;
  settings?: {
    slidesToShow: number;
    slidesToScroll: number;
  };
};

const RESPONSIVE_BREAKPOINTS: ResponsiveBreakPoint[] = [
  {
    breakpoint: 1536,
    settings: {
      slidesToShow: 5,
      slidesToScroll: 1,
    },
  },
  {
    breakpoint: 1280,
    settings: {
      slidesToShow: 4,
      slidesToScroll: 1,
    },
  },
  {
    breakpoint: 1024,
    settings: {
      slidesToShow: 3,
      slidesToScroll: 1,
    },
  },
  {
    breakpoint: 768,
    settings: {
      slidesToShow: 2,
      slidesToScroll: 1,
    },
  },
  {
    breakpoint: 640,
    settings: {
      slidesToShow: 1,
      slidesToScroll: 1,
    },
  },
];

const NextArrow: React.FC<ArrowProps> = ({ onClick }: ArrowProps) => (
  <>
    <Media lessThan="md">
      <button
        aria-label="Next"
        className="right-5 absolute text-4xl -bottom-16 font-semibold focus:outline-none"
        type="button"
        onClick={onClick}
      >
        <Image height="24px" width="48px" src={ARROW_NEXT_SVG} />
      </button>
    </Media>

    <Media greaterThanOrEqual="md">
      <button
        aria-label="Next"
        className="absolute right-5 -bottom-56 my-10 font-semibold flex items-center space-x-6 focus:outline-none"
        type="button"
        onClick={onClick}
      >
        <p className="mr-6">Next</p>
        <Image height="44px" width="84px" src={ARROW_NEXT_SVG} />
      </button>
    </Media>
  </>
);

const PrevArrow: React.FC<ArrowProps> = ({ onClick }: ArrowProps) => (
  <>
    <Media lessThan="md">
      <button
        aria-label="Previous"
        className="left-5 absolute text-4xl -bottom-16 font-semibold focus:outline-none"
        type="button"
        onClick={onClick}
      >
        <Image height="24px" width="48px" src={ARROW_PREVIOUS_SVG} />
      </button>
    </Media>

    <Media greaterThanOrEqual="md">
      <button
        aria-label="Previous"
        className="absolute left-5 -bottom-56 my-10 font-semibold flex items-center space-x-6 focus:outline-none"
        type="button"
        onClick={onClick}
      >
        <Image height="44px" width="84px" src={ARROW_PREVIOUS_SVG} />
        <span>Previous</span>
      </button>
    </Media>
  </>
);

const TeamCarousel: React.FC = () => {
  const slickRef = useRef();
  const [sliderIndex, setSliderIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleProgress = useCallback(() => {
    if (slickRef.current) {
      const { state }: { state: ResponsiveBreakPoint } = slickRef.current;
      const currentSettings = RESPONSIVE_BREAKPOINTS.find(
        ({ breakpoint }) => breakpoint === state.breakpoint
      );
      if (currentSettings) {
        const result = Math.ceil(
          (100 / TEAM.length) * (currentSettings.settings.slidesToShow + sliderIndex)
        );
        setProgress(result);
      } else {
        setProgress(0);
      }
    }
  }, [useRef, sliderIndex]);

  const settings = {
    dots: false,
    infinite: false,
    slidesToShow: 6,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    onInit: handleProgress,
    onReInit: handleProgress,
    beforeChange: (current, next) => setSliderIndex(next),
    responsive: RESPONSIVE_BREAKPOINTS,
  };

  return (
    <div className="bg-beige pb-28">
      <Wrapper hasPadding={false}>
        <h2 className="text-center font-heading-2 mb-10">Meet our team</h2>
        <div>
          <Slider {...settings} ref={slickRef}>
            {TEAM.map((t) => (
              <div className="p-5" key={t.key}>
                <Card role={t.role} name={t.name} photo={t.img} profileURL={t.profileURL} />
              </div>
            ))}
          </Slider>
        </div>
        <div className="relative z-50 mx-5 mt:10 lg:mt-28">
          <AnimatePresence>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              style={{
                marginTop: '-2px',
                width: `${progress}%`,
              }}
              className="h-1 bg-black"
            />
          </AnimatePresence>
        </div>
      </Wrapper>
    </div>
  );
};

export default TeamCarousel;
