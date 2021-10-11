import React, { useMemo, useState } from 'react';

import Slider from 'react-slick';

import Image from 'next/image';

import { motion, AnimatePresence } from 'framer-motion';

import { Media } from 'containers/media';

import ARROW_PREVIOUS_SVG from 'svgs/arrow-left.svg';
import ARROW_NEXT_SVG from 'svgs/arrow-right.svg';

import Card from './card';
import TEAM from './constants';

export interface ArrowProps {
  onClick?: () => void;
}

const NextArrow: React.FC<ArrowProps> = ({ onClick }: ArrowProps) => (
  <>
    <Media lessThan="md">
      <button
        aria-label="Next"
        className="absolute right-3.5 flex items-center space-x-6 text-4xl font-sans-semibold -bottom-36"
        type="button"
        onClick={onClick}
      >
        <Image height="24px" width="48px" src={ARROW_NEXT_SVG} />
      </button>
    </Media>

    <Media greaterThanOrEqual="md">
      <button
        aria-label="Next"
        className="absolute right-0 flex items-center space-x-6 text-4xl font-sans-semibold -bottom-48"
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
        className="left-3.5 absolute text-4xl md:container font-sans-semibold -bottom-36"
        type="button"
        onClick={onClick}
      >
        <Image height="24px" width="48px" src={ARROW_PREVIOUS_SVG} />
      </button>
    </Media>

    <Media greaterThanOrEqual="md">
      <button
        aria-label="Previous"
        className="container absolute z-50 flex items-center w-40 text-4xl md:w-56 lg:w-56 md:space-x-6 font-sans-semibold -bottom-48"
        type="button"
        onClick={onClick}
      >
        <Image height="44px" width="84px" src={ARROW_PREVIOUS_SVG} />
        <p>Previous</p>
      </button>
    </Media>
  </>
);

const TeamCarousel: React.FC = () => {
  const [currentFirstSlide, setcurrentFirstSlide] = useState(0);

  const progressFill = useMemo(
    () => currentFirstSlide < TEAM.length + 1 && (100 / TEAM.length) * currentFirstSlide,
    [currentFirstSlide]
  );

  const settings = {
    infinite: true,
    centerMode: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    beforeChange: (current) => setcurrentFirstSlide(current + 2),
    responsive: [
      {
        breakpoint: 1950,
        settings: {
          slidesToShow: 5.2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1700,
        settings: {
          slidesToShow: 4.4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1450,
        settings: {
          slidesToShow: 3.6,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1025,
        settings: {
          slidesToShow: 2.5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 1.8,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 500,
        settings: {
          centerMode: false,
          slidesToShow: 1.1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="relative lg:pb-96 md:pb-72 pb-48 px-3.5 md:px-0">
      <div
        style={{ height: '46%' }}
        className="absolute top-0 left-0 w-full pt-4 bg-center bg-cover md:pt-0 bg-bege"
      >
        <h3 className="px-3.5 md:px-0 font-sans text-5xl font-semibold md:text-center md:font-normal md:text-6xl lg:text-7xl">
          Meet our team
        </h3>
      </div>
      <div
        style={{ height: '55%' }}
        className="absolute bottom-0 left-0 w-full -mb-1 bg-bege md:bg-lightBlue"
      >
        <div style={{ width: '90%', marginLeft: '5%' }} className="h-px mt-56 bg-lightGray" />
        <AnimatePresence>
          <div style={{ marginLeft: '5%', marginRight: '5%' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressFill || 100 / TEAM.length}%` }}
              transition={{ duration: 0.4 }}
              style={{
                marginTop: '-2px',
                width: `${progressFill || 100 / TEAM.length}%`,
              }}
              className="h-1 bg-black"
            />
          </div>
        </AnimatePresence>
      </div>
      <div className="pt-20 md:pt-40">
        <Media lessThan="md">
          <Slider {...settings}>
            {TEAM.map((t) => (
              <Card
                key={t.key}
                role={t.role}
                name={t.name}
                photo={t.img}
                profileURL={t.profileURL}
              />
            ))}
          </Slider>
        </Media>
        <Media greaterThanOrEqual="md">
          <div className="px-12 lg:px-16 xl:px-24">
            <Slider {...settings}>
              {TEAM.map((t) => (
                <Card
                  key={t.key}
                  role={t.role}
                  name={t.name}
                  photo={t.img}
                  profileURL={t.profileURL}
                />
              ))}
            </Slider>
          </div>
        </Media>
      </div>
    </div>
  );
};

export default TeamCarousel;
