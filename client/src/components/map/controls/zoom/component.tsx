import { useCallback, useEffect } from 'react';
import cx from 'classnames';

import { MinusIcon, PlusIcon } from '@heroicons/react/solid';

import type { ViewportProps } from 'react-map-gl';

export interface ZoomControlProps {
  viewport: Partial<ViewportProps>;
  className?: string;
  onZoomChange: (zoom: number) => void;
}

const HOVER_CLASSES = 'hover:bg-gray-300 active:bg-gray-200 cursor-pointer';
const DISABLED_CLASSES = 'opacity-50 cursor-default';

export const ZoomControl: React.FC<ZoomControlProps> = ({
  className,
  viewport: { zoom, maxZoom, minZoom },
  onZoomChange,
}) => {
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

      if (zoom - 1 >= minZoom) {
        onZoomChange(Math.ceil(zoom - 1));
      }
    },
    [zoom, minZoom, onZoomChange],
  );

  useEffect(() => {
    onZoomChange(zoom);
  }, [onZoomChange, zoom]);

  return (
    <div
      className={cx(
        'bg-white text-gray-900 w-fit ml-auto mr-0 mb-4 text-4xl flex flex-col justify-center select-none divide-y-[1.5px] rounded-lg border border-gray-200 overflow-hidden',
        className,
      )}
    >
      <button
        className={cx('p-2', {
          [HOVER_CLASSES]: zoom !== maxZoom,
          [DISABLED_CLASSES]: zoom === maxZoom,
        })}
        aria-label="Zoom in"
        type="button"
        disabled={zoom === maxZoom}
        onClick={increaseZoom}
      >
        <PlusIcon className="w-5 h-5" />
      </button>
      <button
        className={cx('p-2', {
          [HOVER_CLASSES]: zoom !== minZoom,
          [DISABLED_CLASSES]: zoom === minZoom,
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
