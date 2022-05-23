import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDoubleLeftIcon } from '@heroicons/react/outline';
import cx from 'classnames';

import ImpactLegendItem from './impact-legend-item';
import MaterialLegendItem from './material-legend-item';
import RiskLegendItem from './risk-legend-item';
import Sortable from 'containers/sortable';
import { SortableItem } from 'containers/sortable/component';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisMap, setLayerOrder } from 'store/features/analysis/map';

export const Legend: React.FC = () => {
  const [showLegend, setShowLegend] = useState<boolean>(true); // by default the legend is not collapsed
  const [showContextualLayers, setShowContextualLayers] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const layers = useAppSelector(analysisMap).layers;

  const handleShowLegend = useCallback(() => {
    setShowLegend(!showLegend);
  }, [showLegend]);

  const onToggleActive = useCallback(() => {
    setShowContextualLayers(!showContextualLayers);
  }, [showContextualLayers]);

  const legends = useMemo(
    () => ({
      'h3-layer-material': <MaterialLegendItem />,
      'h3-layer-risk': <RiskLegendItem />,
      'h3-layer-impact': <ImpactLegendItem />,
    }),
    [],
  );

  useEffect(() => {
    dispatch(setLayerOrder(Object.keys(legends)));
  }, [dispatch, legends]);

  const orderedLayers = useMemo(() => {
    const ordered = Object.values(layers)
      // .filter((legend) => legend.id !== 'h3-layer-impact')
      .sort((a, b) => a.order - b.order);

    if (showContextualLayers) return ordered;

    return ordered.filter((legend) => legend.id === 'h3-layer-impact');
  }, [layers, showContextualLayers]);

  return (
    <div className="relative">
      {showLegend && (
        <div className="absolute z-10 bottom-0 right-12 flex flex-col flex-grow shadow-sm bg-white border border-gray-200 rounded-lg overflow-hidden w-80 max-w-xs">
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
          <Sortable
            items={orderedLayers.map((layer) => layer.id)}
            onChangeOrder={(orderedIds) => {
              dispatch(setLayerOrder([...orderedIds]));
            }}
          >
            {orderedLayers.map(({ id }) => (
              <SortableItem key={id} id={id}>
                <div className="border-t border-gray-100">{legends[id]}</div>
              </SortableItem>
            ))}
          </Sortable>
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
