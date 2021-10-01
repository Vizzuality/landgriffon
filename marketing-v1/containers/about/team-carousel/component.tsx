import React from 'react';

import Slider from 'react-slick';

import Image from 'next/image';

import ARROW_PREVIOUS_SVG from 'svgs/arrow-left.svg';
import ARROW_NEXT_SVG from 'svgs/arrow-right.svg';

import Card from './card';
import TEAM from './constants';

export interface ArrowProps {
  onClick?: () => void;
}

const NextArrow: React.FC<ArrowProps> = ({ onClick }: ArrowProps) => (
  <button
    aria-label="Next"
    className="absolute right-0 flex items-center space-x-6 font-sans text-4xl font-semibold -bottom-48"
    type="button"
    onClick={onClick}
  >
    <p>Next</p>
    <Image height="44px" width="84px" src={ARROW_NEXT_SVG} />
  </button>
);

const PrevArrow: React.FC<ArrowProps> = ({ onClick }: ArrowProps) => (
  <button
    aria-label="Previous"
    className="absolute left-0 flex items-center space-x-6 font-sans text-4xl font-semibold -bottom-48"
    type="button"
    onClick={onClick}
  >
    <Image height="44px" width="84px" src={ARROW_PREVIOUS_SVG} />
    <p>Previous</p>
  </button>
);

export const TeamCarousel: React.FC = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 3,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div className="relative pb-56">
      <div className="absolute top-0 left-0 w-full bg-center bg-cover bg-bege h-2/6" />
      <div className="absolute bottom-0 left-0 w-full bg-lightBlue h-4/6" />
      <Slider {...settings}>
        {TEAM.map((t) => (
          <Card key={t.key} role={t.role} name={t.name} photo={t.img} />
        ))}
      </Slider>
    </div>
  );
};

export default TeamCarousel;
