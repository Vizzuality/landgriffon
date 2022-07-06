import { useCallback, useEffect, useMemo, useState } from 'react';

import ImpactLegendItem from './impact-legend-item';
import MaterialLegendItem from './material-legend-item';
import RiskLegendItem from './risk-legend-item';
import WaterLegendItem from './water-legend-item';
import Sortable from 'containers/sortable';
import { SortableItem } from 'containers/sortable/component';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisMap, setLayerOrder } from 'store/features/analysis/map';
import { Layer } from 'types';
import classNames from 'classnames';

const sortByOrder: (layers: Record<string, Layer>) => Layer[] = (layers) => {
  return Object.values(layers).sort((a, b) => a.order - b.order);
};

export const Legend: React.FC = () => {
  const [showLegend, setShowLegend] = useState<boolean>(true); // by default the legend is not collapsed
  const [showContextualLayers, setShowContextualLayers] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const layers = useAppSelector(analysisMap).layers;

  const handleShowLegend = useCallback(() => {
    setShowLegend((show) => !show);
  }, []);

  const onToggleActive = useCallback(() => {
    setShowContextualLayers(!showContextualLayers);
  }, [showContextualLayers]);

  const legends = useMemo(
    () => ({
      'h3-layer-material': <MaterialLegendItem />,
      'h3-layer-risk': <RiskLegendItem />,
      'h3-layer-water': <WaterLegendItem />,
      'h3-layer-impact': <ImpactLegendItem />,
    }),
    [],
  );

  useEffect(() => {
    dispatch(setLayerOrder(Object.keys(legends)));
  }, [dispatch, legends]);

  const allOrderedLayers = useMemo(() => sortByOrder(layers), [layers]);

  const orderedLayers = useMemo(() => {
    if (showContextualLayers) return allOrderedLayers;

    return allOrderedLayers.filter((legend) => legend.id === 'h3-layer-impact');
  }, [allOrderedLayers, showContextualLayers]);

  const activeLayerCount = Object.values(layers).filter((layer) => layer.active).length;

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
        className="bg-white border border-gray-100 h-10 w-full rounded-lg relative flex items-center justify-center"
        onClick={handleShowLegend}
      >
        {activeLayerCount !== 0 && (
          <div className="absolute rounded-full text-xs text-white bg-green-700 w-4 h-4 bottom-0 right-0 translate-x-1/2 translate-y-1/2 font-bold">
            <span className="relative my-auto h-fit">{activeLayerCount}</span>
          </div>
        )}
        <div className="mt-2">
          {allOrderedLayers.map((layer) => (
            <div
              key={layer.id}
              className={classNames(
                'relative border-[1px] border-white skew-x-[45deg] skew-y-[-20deg] w-[18px] h-[10px] rounded-sm transition-[margin] -mb-[6px] first:-mt-[6px] last:mb-0',
                {
                  'bg-gray-900': layer.active,
                  'bg-gray-500': !layer.active,
                },
              )}
              style={{ zIndex: allOrderedLayers.length - layer.order }}
            />
          ))}
        </div>
      </button>
    </div>
  );
};

export default Legend;
