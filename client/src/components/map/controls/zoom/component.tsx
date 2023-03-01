import { useCallback } from 'react';
import cx from 'classnames';
import { useMap } from 'react-map-gl';
import { MinusIcon, PlusIcon } from '@heroicons/react/solid';

import type { MouseEventHandler } from 'react';

export interface ZoomControlProps {
  mapId?: string;
  className?: string;
}

const COMMON_CLASSES =
  'p-2 transition-colors bg-white cursor-pointer hover:bg-gray-100 active:bg-navy-50 disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-default';

export const ZoomControl: React.FC<ZoomControlProps> = ({ className, mapId = 'default' }) => {
  const { [mapId]: mapRef } = useMap();
  const zoom = mapRef?.getZoom();
  const minZoom = mapRef?.getMinZoom();
  const maxZoom = mapRef?.getMaxZoom();

  const increaseZoom = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (evt) => {
      evt.stopPropagation();
      if (!mapRef) return null;

      mapRef.zoomIn();
    },
    [mapRef],
  );

  const decreaseZoom = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (evt) => {
      evt.stopPropagation();
      if (!mapRef) return null;

      mapRef.zoomOut();
    },
    [mapRef],
  );

  return (
    <div
      className={cx(
        'text-gray-900 ml-auto text-4xl flex flex-col justify-center select-none gap-[1.5px] rounded-lg border border-gray-200 overflow-hidden',
        className,
      )}
    >
      <button
        className={COMMON_CLASSES}
        aria-label="Zoom in"
        type="button"
        // ? Sometimes, depending on the viewport, the map will not reach zoom 22 but 21.X.
        // ? As we have no control over this, we are assuming, if no maxZoom is set, going further zoom level 21 will be considered as the limit
        disabled={zoom >= maxZoom || (!maxZoom && zoom > 21)}
        onClick={increaseZoom}
      >
        <PlusIcon className="w-5 h-5" />
      </button>
      <button
        className={COMMON_CLASSES}
        aria-label="Zoom out"
        type="button"
        // ? Sometimes, depending on the viewport, the map will not reach zoom 0 but 0.X.
        // ? As we have no control over this, we are assuming, if no minZoom is set, going below zoom level 1 will be considered as the limit
        disabled={zoom <= minZoom || (!minZoom && zoom < 1)}
        onClick={decreaseZoom}
      >
        <MinusIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ZoomControl;
