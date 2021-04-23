import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import Slider from 'react-slick';
import AnimationPlayer from 'components/animation-player';

import barChartAnimation from './animations/bar-chart.json';
import linearChartAnimation from './animations/linear-chart.json';
import donutCharAnimation from './animations/donut-chart.json';

const sliderSettings = {
  arrows: false,
  autoplay: true,
  autoplaySpeed: 6000,
  className: 'h-96 lg:h-screen overflow-hidden',
  dots: false,
  draggable: false,
  fade: true,
  infinite: true,
  pauseOnHover: false,
  speed: 700,
};

const slideClassnames = 'h-96 lg:h-screen flex items-center justify-center';

const initialSlidesData = [
  {
    slug: 'land-view-1',
    name: 'Land view green',
    backgroundImage: '/slides/land-view-1.jpg',
    animationData: barChartAnimation,
    isAnimating: false,
  },
  {
    slug: 'land-view-2',
    name: 'Land view yellow',
    backgroundImage: '/slides/land-view-2.jpg',
    animationData: linearChartAnimation,
    isAnimating: false,
  },
  {
    slug: 'land-view-3',
    name: 'Land view brown',
    backgroundImage: '/slides/land-view-3.jpg',
    animationData: donutCharAnimation,
    isAnimating: false,
  },
];

const Banner: React.FC = () => {
  const { basePath } = useRouter();
  const [slidesData, setSlidesData] = useState(initialSlidesData);

  const handleAfterChange = useCallback((newIndex) => {
    setSlidesData(slidesData.map((slideData, index) => ({
      ...slideData,
      isAnimating: index === newIndex,
    })));
  }, [slidesData]);

  const handleOnInit = useCallback(() => {
    setSlidesData(slidesData.map((slideData, index) => ({
      ...slideData,
      isAnimating: index === 0,
    })));
  }, [slidesData]);

  return (
    <div>
      <Slider
        {...sliderSettings}
        afterChange={handleAfterChange}
        onInit={handleOnInit}
      >
        {slidesData.map(({
          animationData, backgroundImage, isAnimating, name, slug,
        }) => (
          <div
            className={slideClassnames}
            key={slug}
          >
            <img src={`${basePath}${backgroundImage}`} className="h-full object-center object-cover" alt={name} width="1082px" height="1800px" />
            {isAnimating && (
              <AnimationPlayer animationData={animationData} className="absolute top-0 left-0 w-full h-full" loop={false} />
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;
