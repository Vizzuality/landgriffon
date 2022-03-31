import { useCallback } from 'react';
import classNames from 'classnames';
import { ChartPieIcon, MapIcon, TableIcon } from '@heroicons/react/outline';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisUI, setVisualizationMode } from 'store/features/analysis/ui';
import { analysisFilters } from 'store/features/analysis/filters';

const CONTROL_ITEM_CLASS_NAMES =
  'relative inline-flex items-center px-4 py-1.5 border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-green-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700';
const CONTROL_ITEM_ACTIVE_CLASS_NAMES =
  'z-10 outline-none ring-1 ring-green-700 text-green-700 border-green-700 bg-green-50';

const ModeControl: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysisUI);
  const { layer } = useAppSelector(analysisFilters);
  const dispatch = useAppDispatch();

  const handleClick = useCallback((mode) => dispatch(setVisualizationMode(mode)), [dispatch]);

  if (layer !== 'impact' && visualizationMode !== 'map') return null;

  return (
    <div className="inline-flex shadow-sm rounded-md">
      <button
        onClick={() => handleClick('map')}
        className={classNames(CONTROL_ITEM_CLASS_NAMES, 'rounded-l-md', {
          [CONTROL_ITEM_ACTIVE_CLASS_NAMES]: visualizationMode === 'map',
        })}
      >
        <MapIcon className="h-6 w-6" aria-hidden="true" />
      </button>
      <button
        onClick={() => handleClick('table')}
        className={classNames(CONTROL_ITEM_CLASS_NAMES, '-ml-px', {
          [CONTROL_ITEM_ACTIVE_CLASS_NAMES]: visualizationMode === 'table',
        })}
      >
        <TableIcon className="h-6 w-6" aria-hidden="true" />
      </button>
      <button
        onClick={() => handleClick('chart')}
        className={classNames(CONTROL_ITEM_CLASS_NAMES, '-ml-px rounded-r-md', {
          [CONTROL_ITEM_ACTIVE_CLASS_NAMES]: visualizationMode === 'chart',
        })}
      >
        <ChartPieIcon className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
};

export default ModeControl;
