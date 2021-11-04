import { useCallback } from 'react';
import cx from 'classnames';

import { MinusIcon, PlusIcon } from '@heroicons/react/solid';

import type { ViewportProps } from 'react-map-gl';

export interface ZoomControlProps {
  viewport: Partial<ViewportProps>;
  className?: string;
  onZoomChange: (zoom: number) => void;
}

export const ZoomControl: React.FC<ZoomControlProps> = ({
  className,
  viewport,
  onZoomChange,
}: ZoomControlProps) => {
  const { zoom, maxZoom, minZoom } = viewport;

  const increaseZoom = useCallback(
    (e) => {
      e.stopPropagation();

      if (zoom + 1 <= maxZoom) {
        onZoomChange(zoom + 1);
      }
    },
    [zoom, maxZoom, onZoomChange],
  );

  const decreaseZoom = useCallback(
    (e) => {
      e.stopPropagation();

      if (zoom + 1 >= minZoom) {
        onZoomChange(zoom - 1);
      }
    },
    [zoom, minZoom, onZoomChange],
  );

  return (
    <div
      className={cx({
        'inline-flex flex-col': true,
        [className]: !!className,
      })}
    >
      <button
        className={cx({
          'mb-0.5 p-0.5 rounded-t-3xl text-white bg-black': true,
          'hover:bg-gray-700 active:bg-gray-600': zoom !== maxZoom,
          'opacity-50 cursor-default': zoom === maxZoom,
        })}
        aria-label="Zoom in"
        type="button"
        disabled={zoom === maxZoom}
        onClick={increaseZoom}
      >
        <PlusIcon className="w-5 h-5" />
      </button>
      <button
        className={cx({
          'p-0.5 rounded-b-3xl text-white bg-black': true,
          'hover:bg-gray-700 active:bg-gray-600': zoom !== minZoom,
          'opacity-50 cursor-default': zoom === minZoom,
        })}
        aria-label="Zoom out"
        type="button"
        disabled={zoom === minZoom}
        onClick={decreaseZoom}
      >
        <MinusIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ZoomControl;
