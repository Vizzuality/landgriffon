import { MinusIcon, PlusIcon } from '@heroicons/react/solid';
import cx from 'classnames';

import type { MapViewState } from '@deck.gl/core/typed';
import type { FC } from 'react';

const COMMON_CLASSES =
  'p-2 transition-colors bg-white cursor-pointer hover:bg-gray-100 active:bg-navy-50 disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-default';

const ZoomControl: FC<{
  viewState: MapViewState;
  className?: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
}> = ({ viewState, className = null, onZoomIn, onZoomOut }) => {
  const { zoom, minZoom, maxZoom } = viewState;

  return (
    <div
      className={cx(
        'ml-auto flex select-none flex-col justify-center gap-[1.5px] overflow-hidden rounded-lg border border-gray-200 text-4xl text-gray-900',
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
        onClick={onZoomIn}
      >
        <PlusIcon className="h-5 w-5" />
      </button>
      <button
        className={COMMON_CLASSES}
        aria-label="Zoom out"
        type="button"
        // ? Sometimes, depending on the viewport, the map will not reach zoom 0 but 0.X.
        // ? As we have no control over this, we are assuming, if no minZoom is set, going below zoom level 1 will be considered as the limit
        disabled={zoom <= minZoom || (!minZoom && zoom < 1)}
        onClick={onZoomOut}
      >
        <MinusIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ZoomControl;
