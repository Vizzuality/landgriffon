import React from 'react';
import Slider from 'react-slick';

const settings = {
  arrows: false,
  dots: false,
  draggable: false,
  fade: true,
  infinite: true,
  speed: 700,
};

const Banner: React.FC = () => (
  <div>
    <Slider {...settings}>
      <div>
        <img src="/land-view-1.jpg" alt="Land view 1" />
      </div>
      <div>
        <img src="/land-view-2.jpg" alt="Land view 2" />
      </div>
      <div>
        <img src="/land-view-3.jpg" alt="Land view 3" />
      </div>
    </Slider>
  </div>
);

export default Banner;
