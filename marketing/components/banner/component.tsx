import React, { useCallback, useState } from 'react';
import Slider from 'react-slick';
import AnimationPlayer from 'components/animation-player';

import barChartAnimation from './animations/bar-chart.json';
import linearChartAnimation from './animations/linear-chart.json';
import donutCharAnimation from './animations/donut-chart.json';

const sliderSettings = {
  arrows: false,
  autoplay: true,
  autoplaySpeed: 6000,
  className: 'h-96 lg:h-screen',
  dots: false,
  draggable: false,
  fade: true,
  infinite: true,
  speed: 700,
};

const slideClassnames = 'h-96 lg:h-screen bg-cover bg-center flex items-center justify-center';

const initialSlidesData = [
  {
    slug: 'land-view-1',
    backgroundImage: 'url(/slides/land-view-1.jpg)',
    animationData: barChartAnimation,
    isAnimating: false,
  },
  {
    slug: 'land-view-2',
    backgroundImage: 'url(/slides/land-view-2.jpg)',
    animationData: linearChartAnimation,
    isAnimating: false,
  },
  {
    slug: 'land-view-3',
    backgroundImage: 'url(/slides/land-view-3.jpg)',
    animationData: donutCharAnimation,
    isAnimating: false,
  },
];

const Banner: React.FC = () => {
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
          animationData, backgroundImage, isAnimating, slug,
        }) => (
          <div key={slug}>
            <div
              className={slideClassnames}
              style={{ backgroundImage }}
            >
              {isAnimating && (
                <AnimationPlayer animationData={animationData} />
              )}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;
