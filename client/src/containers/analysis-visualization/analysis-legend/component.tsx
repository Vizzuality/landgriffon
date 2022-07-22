import { useCallback, useEffect, useMemo, useState } from 'react';

import Sortable from 'containers/sortable';
import { SortableItem } from 'containers/sortable/component';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';
import type { Layer } from 'types';
import useContextualLayers from 'hooks/layers/getContextualLayers';
import ContextualLegendItem from './contextual-legend-item';
import ImpactLayer from './impact-legend-item';
import classNames from 'classnames';

const sortByOrder: (layers: Record<string, Layer>) => Layer[] = (layers) => {
  return Object.values(layers).sort((a, b) => a.order - b.order);
};

export const Legend: React.FC = () => {
  const [showLegend, setShowLegend] = useState<boolean>(true); // by default the legend is not collapsed
  const [showContextualLayers, setShowContextualLayers] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const { data: upstreamLayers } = useContextualLayers();
  const { layers } = useAppSelector(analysisMap);

  useEffect(() => {
    upstreamLayers?.forEach((layer, i) => {
      dispatch(setLayer({ id: layer.id, layer: { ...layer, order: i + 1, isContextual: true } }));
    });
  }, [dispatch, upstreamLayers]);

  const handleShowLegend = useCallback(() => {
    setShowLegend((show) => !show);
  }, []);

  const onToggleActive = useCallback(() => {
    setShowContextualLayers((show) => !show);
  }, []);

  const allOrderedLayers = useMemo(() => {
    return sortByOrder(layers);
  }, [layers]);

  const LegendToShow = useCallback(
    (layer: Layer) =>
      layer.isContextual ? <ContextualLegendItem layer={layer} /> : <ImpactLayer />,
    [],
  );

  const orderedLayers = useMemo(() => {
    if (showContextualLayers) return allOrderedLayers;

    return allOrderedLayers.filter((layer) => !layer.isContextual);
  }, [allOrderedLayers, showContextualLayers]);

  const activeLayerCount = Object.values(layers).filter((layer) => layer.active).length;

  return (
    <div className="relative">
      {showLegend && (
        <div className="absolute bottom-0 z-10 flex flex-col flex-grow max-w-xs overflow-hidden overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-sm right-12 w-80 md:max-h-[75vh]">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="text-sm font-semibold text-gray-900">Legend</div>
            <button
              type="button"
              aria-expanded={showContextualLayers}
              className="text-xs text-green-700"
              onClick={onToggleActive}
            >
              <span>{showContextualLayers ? 'Hide' : 'Show'} contextual layers</span>
            </button>
          </div>
          <Sortable
            items={orderedLayers.map((layer) => layer.id)}
            onChangeOrder={(orderedIds) => {
              orderedIds.forEach((id, i) => {
                dispatch(setLayer({ id, layer: { order: i } }));
              });
            }}
          >
            {orderedLayers.map((layer) => (
              <SortableItem key={layer.id} id={layer.id}>
                {LegendToShow(layer)}
              </SortableItem>
            ))}
          </Sortable>
        </div>
      )}
      <button
        type="button"
        className="relative flex items-center justify-center w-full h-10 bg-white border border-gray-100 rounded-lg"
        onClick={handleShowLegend}
      >
        {activeLayerCount !== 0 && (
          <div className="absolute bottom-0 right-0 w-4 h-4 text-xs font-bold text-white translate-x-1/2 translate-y-1/2 bg-green-700 rounded-full">
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
