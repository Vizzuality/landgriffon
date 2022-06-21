import React, { ReactElement, useEffect, useRef, useState } from 'react';

import Flicking, { ERROR_CODE, FlickingError } from '@egjs/react-flicking';

export interface CarouselProps {
  slide: number;
  slides: {
    id: string | number;
    content?: ReactElement;
  }[];
  autoplay?: boolean;
  onChange?: (slide: number) => void;
}

export const Carousel: React.FC<CarouselProps> = ({
  slide,
  slides,
  autoplay,
  onChange,
}: CarouselProps) => {
  const slider = useRef(null);
  const timer = useRef(null);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);

    if (autoplay) {
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
      }, 3000);
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
    <div className="relative w-full">
      <div
        role="presentation"
        className="overflow-hidden"
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
          duration={500}
          circular
          onWillChange={({ index }) => {
            if (onChange) onChange(index);
          }}
        >
          {slides.map((sl) => {
            return (
              <div key={sl.id} className="w-full">
                {sl.content}
              </div>
            );
          })}
        </Flicking>
      </div>
    </div>
  );
};

export default Carousel;
