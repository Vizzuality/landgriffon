import React, { ReactElement, useEffect, useRef, useState, cloneElement } from 'react';

import Flicking, { ERROR_CODE, FlickingError } from '@egjs/react-flicking';

import { Fade } from '@egjs/flicking-plugins';

export interface CarouselProps {
  slide: number;
  slides: {
    id: string | number;
    content?: ReactElement;
  }[];
  autoplay?: boolean | number;
  options?: Record<string, any>;
  onChange?: (slide: number) => void;
}

export const Carousel: React.FC<CarouselProps> = ({
  slide,
  slides,
  autoplay,
  options = {
    duration: 500,
    circular: true,
    bound: false,
  },
  onChange,
}: CarouselProps) => {
  const slider = useRef(null);
  const timer = useRef(null);
  const [pause, setPause] = useState(false);
  const plugings = new Fade();

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);

    if (autoplay) {
      const autoplayTime = typeof autoplay === 'number' ? autoplay : 3000;
      timer.current = setInterval(() => {
        if (!pause && slider) {
          slider.current.next().catch((err) => {
            if (
              !(
                err instanceof FlickingError &&
                (err.code === ERROR_CODE.ANIMATION_ALREADY_PLAYING ||
                  err.code === ERROR_CODE.ANIMATION_INTERRUPTED)
              )
            ) {
              throw err;
            }
          });
        }
      }, autoplayTime);
    }

    return () => {
      if (timer.current && autoplay) clearInterval(timer.current);
    };
  }, [pause, slider, slide, autoplay]);

  useEffect(() => {
    if (slider.current) {
      slider.current.moveTo(slide).catch((err) => {
        if (
          !(
            err instanceof FlickingError &&
            (err.code === ERROR_CODE.ANIMATION_ALREADY_PLAYING ||
              err.code === ERROR_CODE.ANIMATION_INTERRUPTED)
          )
        ) {
          throw err;
        }
      });
    }
  }, [slide]);

  return (
    <div className="w-full">
      <div
        role="presentation"
        className="overflow-hidden space-x-5"
        onMouseOver={() => {
          if (timer.current) clearInterval(timer.current);
          setPause(true);
        }}
        onFocus={() => {
          if (timer.current) clearInterval(timer.current);
          setPause(true);
        }}
        onMouseOut={() => {
          if (timer.current) clearInterval(timer.current);
          setPause(false);
        }}
        onBlur={() => {
          if (timer.current) clearInterval(timer.current);
          setPause(false);
        }}
      >
        <Flicking
          ref={slider}
          onWillChange={({ index }) => {
            if (onChange) onChange(index);
          }}
          {...{ ...options, plugins: [plugings] }}
        >
          {slides.map((sl) => {
            return cloneElement(sl.content, {
              key: sl.id,
            });
          })}
        </Flicking>
      </div>
    </div>
  );
};

export default Carousel;
