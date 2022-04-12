import { useCallback, useState } from 'react';
import { ChevronDoubleLeftIcon } from '@heroicons/react/outline';
import cx from 'classnames';

import ImpactLegendItem from './impact-legend-item';
import MaterialLegendItem from './material-legend-item';
import RiskLegendItem from './risk-legend-item';

export const Legend: React.FC = () => {
  const [showLegend, setShowLegend] = useState<boolean>(true); // by default the legend is not collapsed
  const [showContextualLayers, setShowContextualLayers] = useState<boolean>(false);

  const handleShowLegend = useCallback(() => {
    setShowLegend(!showLegend);
  }, [showLegend]);

  const onToggleActive = useCallback(() => {
    setShowContextualLayers(!showContextualLayers);
  }, [showContextualLayers]);

  return (
    <div className="relative">
      {showLegend && (
        <div className="absolute z-10 bottom-0 right-12 flex flex-col flex-grow shadow-sm bg-white border border-gray-200 rounded w-72">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="font-semibold text-gray-900 text-sm">Legend</div>
            <button
              type="button"
              aria-expanded={showContextualLayers}
              className="text-green-700 text-xs"
              onClick={onToggleActive}
            >
              <span>{showContextualLayers ? 'Hide' : 'Show'} contextual layers</span>
            </button>
          </div>

          {/* Contextual layers */}
          {showContextualLayers && (
            <div className="relative flex flex-col flex-grow">
              <div className="border-t border-gray-100">
                <MaterialLegendItem />
              </div>
              <div className="border-t border-gray-100">
                <RiskLegendItem />
              </div>
            </div>
          )}

          {/* Main layer: it will be always active */}
          <div
            className="relative flex flex-col flex-grow border-t border-gray-100"
            style={{
              maxHeight: 400,
            }}
          >
            <div>
              <ImpactLegendItem />
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        className="bg-white border border-gray-100 p-2 rounded-lg"
        onClick={handleShowLegend}
      >
        <ChevronDoubleLeftIcon
          className={cx('w-5 h-5 transition-all', { 'rotate-180': showLegend })}
        />
      </button>
    </div>
  );
};

export default Legend;
