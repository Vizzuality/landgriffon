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
import { ChevronDoubleRightIcon } from '@heroicons/react/solid';
import Settings from './settings';
import Modal from 'components/modal';
import SandwichIcon from 'components/icons/sandwich';
import MaterialLayer from './material-legend-item';

const sortByOrder: (layers: Record<string, Layer>) => Layer[] = (layers) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return Object.values(layers).sort((a, b) => a.order! - b.order!);
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
  const nonContextualLayersNumber = useMemo(
    () => Object.values(layers).filter((layer) => !layer.isContextual).length,
    [layers],
  );

  const activeLayerNumber = useMemo(
    () => Object.values(layers).filter((l) => l.active).length,
    [layers],
  );
  const activeContextualLayers = useMemo(
    () => (layers['impact']?.active ? activeLayerNumber - 1 : activeLayerNumber),
    [activeLayerNumber, layers],
  );

  useEffect(() => {
    upstreamLayers?.forEach((layer, i) => {
      dispatch(
        setLayer({
          id: layer.id,
          layer: { ...layer, order: i + nonContextualLayersNumber, isContextual: true },
        }),
      );
    });
  }, [dispatch, nonContextualLayersNumber, upstreamLayers]);

  const handleShowLegend = useCallback(() => {
    setShowLegend((show) => !show);
  }, []);

  const handleToggleShowLegendSettinngs = useCallback(() => {
    setShowSettings((show) => !show);
  }, []);

  const dismissLegendSettings = useCallback(() => setShowSettings(false), []);

  const orderedLayers = useMemo(() => {
    return sortByOrder(layers);
  }, [layers]);

  const LegendToShow = useCallback(
    (layer: Layer) =>
      layer.isContextual ? (
        <ContextualLegendItem layer={layer} />
      ) : layer.id === 'impact' ? (
        <ImpactLayer />
      ) : layer.id === 'material' ? (
        <MaterialLayer />
      ) : null,
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
          <SortableItem
            className={classNames({ hidden: !layer.active })}
            key={layer.id}
            id={layer.id}
          >
            {LegendToShow(layer)}
          </SortableItem>
        ))}
      </Sortable>
    ),
    [LegendToShow, dispatch, orderedLayers],
  );

  return (
    <>
      <div className="relative">
        {showLegend && (
          <div className="absolute bottom-0 z- flex flex-col flex-grow max-w-xs overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm right-12 w-80 md:max-h-[75vh]">
            <div className="overflow-y-auto">
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between px-2 py-1 place-items-center">
                  <div className="px-2 text-sm text-gray-900">Legend</div>
                  <button
                    type="button"
                    aria-expanded={showSettings}
                    className="text-primary py-1.5 px-1.5 flex flex-row gap-2 place-items-center"
                    onClick={handleToggleShowLegendSettinngs}
                  >
                    <span className="my-auto text-xs font-semibold underline underline-offset-2">
                      Contextual Layers
                    </span>
                    {activeContextualLayers > 0 && (
                      <div className="w-4 h-4 font-semibold text-white rounded-full bg-primary text-2xs">
                        <div className="m-auto translate-y-px w-fit">{activeContextualLayers}</div>
                      </div>
                    )}
                  </button>
                </div>
                {Legend}
              </div>
            </div>
          </div>
        )}
        <div className="relative">
          <ToggleShowLegendButton showLegend={showLegend} toggleLegend={handleShowLegend} />
          {activeLayerNumber && !showLegend && (
            <div className="absolute bottom-0 right-0 w-4 h-4 m-auto text-xs font-semibold text-white rounded-full translate-x-1/3 translate-y-1/3 bg-primary">
              <div className="m-auto -translate-y-px w-fit">{activeLayerNumber}</div>
            </div>
          )}
        </div>
      </div>
      <Modal
        size="fit"
        title="Contextual Layers"
        open={showSettings}
        onDismiss={dismissLegendSettings}
      >
        <Settings onApply={dismissLegendSettings} categories={layersByCategory || []} />
      </Modal>
    </>
  );
};

const ToggleShowLegendButton = ({
  showLegend,
  toggleLegend,
}: {
  showLegend: boolean;
  toggleLegend: () => void;
}) => {
  return (
    <button
      type="button"
      className={classNames(
        'transition-[background] relative flex items-center justify-center w-full h-10 bg-white border rounded-lg p-1.5 border-gray-100 hover:border-primary hover:bg-primary hover:bg-opacity-50 hover:text-black group',
        {
          'text-primary': showLegend,
        },
      )}
      onClick={toggleLegend}
    >
      <ChevronDoubleRightIcon
        className={classNames('transition-transform w-full hidden group-hover:block', {
          'rotate-180': showLegend,
        })}
      />
      <div className="group-hover:hidden">
        <SandwichIcon />
      </div>
    </button>
  );
};

export default Legend;
