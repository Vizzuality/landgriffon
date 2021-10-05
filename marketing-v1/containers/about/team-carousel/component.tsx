import React from 'react';

import Slider from 'react-slick';

import Image from 'next/image';

import { Media } from 'containers/media';

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
    className="absolute right-0 flex items-center text-4xl font-sans-semibold -bottom-48"
    type="button"
    onClick={onClick}
  >
    <p className="mr-6">Next</p>
    <Image height="44px" width="84px" src={ARROW_NEXT_SVG} />
  </button>
);

const PrevArrow: React.FC<ArrowProps> = ({ onClick }: ArrowProps) => (
  <button
    aria-label="Previous"
    className="container absolute left-0 flex items-center space-x-6 text-4xl font-sans-semibold -bottom-48"
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
    speed: 1000,
    slidesToShow: 8,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1950,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1700,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1450,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1025,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="relative pb-56">
      <div className="absolute top-0 left-0 w-full bg-center bg-cover bg-bege h-2/6" />
      <div className="absolute bottom-0 left-0 w-full bg-lightBlue h-4/6" />
      <div className="">
        <Slider {...settings}>
          <Media greaterThanOrEqual="lg">
            <Card photo="/images/about/team/susana-romao.jpg" />
          </Media>

          {TEAM.map((t) => (
            <Card key={t.key} role={t.role} name={t.name} photo={t.img} />
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default TeamCarousel;
