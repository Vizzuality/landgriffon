import { useCallback } from 'react';
import cx from 'classnames';
import { MinusIcon, PlusIcon } from '@heroicons/react/solid';

import type { MouseEventHandler } from 'react';
import type { ViewportProps } from 'react-map-gl';

export interface ZoomControlProps {
  viewport: Partial<ViewportProps>;
  className?: string;
  onZoomChange: (zoom: number) => void;
}

const COMMON_CLASSES = 'p-2 transition-colors';
const ENABLED_CLASSES = 'bg-white hover:bg-gray-100 active:bg-navy-50 cursor-pointer';
const DISABLED_CLASSES = 'bg-gray-100 opacity-75 cursor-default';

export const ZoomControl: React.FC<ZoomControlProps> = ({
  className,
  viewport: { zoom, maxZoom, minZoom },
  onZoomChange,
}) => {
  const increaseZoom = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    onZoomChange(zoom + 1 > maxZoom ? maxZoom : zoom + 1);
  }, [zoom, maxZoom, onZoomChange]);

  const decreaseZoom = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    onZoomChange(zoom - 1 < minZoom ? minZoom : zoom - 1);
  }, [zoom, minZoom, onZoomChange]);

  return (
    <div
      className={cx(
        'text-gray-900 ml-auto text-4xl flex flex-col justify-center select-none gap-[1.5px] rounded-lg border border-gray-200 overflow-hidden',
        className,
      )}
    >
      <button
        className={cx(COMMON_CLASSES, {
          [ENABLED_CLASSES]: zoom < maxZoom,
          [DISABLED_CLASSES]: zoom >= maxZoom,
        })}
        aria-label="Zoom in"
        type="button"
        disabled={zoom >= maxZoom}
        onClick={increaseZoom}
      >
        <PlusIcon className="w-5 h-5" />
      </button>
      <button
        className={cx(COMMON_CLASSES, {
          [ENABLED_CLASSES]: zoom > minZoom,
          [DISABLED_CLASSES]: zoom <= minZoom,
        })}
        aria-label="Zoom out"
        type="button"
        disabled={zoom <= minZoom}
        onClick={decreaseZoom}
      >
        <MinusIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ZoomControl;
