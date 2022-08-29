import { useCallback, useEffect, useMemo, useState } from 'react';

import Sortable from 'components/sortable';
import { SortableItem } from 'components/sortable/component';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';
import type { Layer } from 'types';
import useContextualLayers from 'hooks/layers/getContextualLayers';
import ContextualLegendItem from './contextual-legend-item';
import ImpactLayer from './impact-legend-item';
import classNames from 'classnames';
import { ChevronDoubleRightIcon, CogIcon, XIcon } from '@heroicons/react/solid';
import Settings from './settings';

const sortByOrder: (layers: Record<string, Layer>) => Layer[] = (layers) => {
  return Object.values(layers).sort((a, b) => a.order - b.order);
};

export const Legend: React.FC = () => {
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const { data: layersByCategory } = useContextualLayers();
  const upstreamLayers = useMemo(
    () => layersByCategory?.flatMap(({ layers }) => layers),
    [layersByCategory],
  );

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
    setShowSettings((show) => !show);
  }, []);

  const orderedLayers = useMemo(() => {
    return sortByOrder(layers);
  }, [layers]);

  const LegendToShow = useCallback(
    (layer: Layer) =>
      layer.isContextual ? <ContextualLegendItem layer={layer} /> : <ImpactLayer />,
    [],
  );

  const Legend = useMemo(
    () => (
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
    ),
    [LegendToShow, dispatch, orderedLayers],
  );

  return (
    <div className="relative">
      {showLegend && (
        <div className="absolute bottom-0 z-10 flex flex-col flex-grow max-w-xs overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm right-12 w-80 md:max-h-[75vh]">
          <div className="overflow-y-auto">
            <>
              <div className="flex items-center justify-between px-4 py-2">
                <div className="text-sm font-semibold text-gray-900">Legend</div>
                <button
                  type="button"
                  aria-expanded={showSettings}
                  className="text-xs text-green-700"
                  onClick={onToggleActive}
                >
                  <span>
                    {showSettings ? <XIcon className="w-5 h-5" /> : <CogIcon className="w-5 h-5" />}
                  </span>
                </button>
              </div>
              {showSettings ? <Settings categories={layersByCategory} /> : Legend}
            </>
          </div>
        </div>
      )}
      <button
        type="button"
        className="relative flex items-center justify-center w-full h-10 bg-white border border-gray-100 rounded-lg p-1.5"
        onClick={handleShowLegend}
      >
        <ChevronDoubleRightIcon
          className={classNames('transition-transform', {
            'rotate-180': showLegend,
          })}
        />
      </button>
    </div>
  );
};

export default Legend;
