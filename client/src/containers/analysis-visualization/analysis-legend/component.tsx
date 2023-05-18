import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { ChevronDoubleRightIcon } from '@heroicons/react/solid';

import ContextualLegendItem from './contextual-legend-item';
import ImpactLayer from './impact-legend-item';
import MaterialLayer from './material-legend-item';

import ContextualLayers from 'containers/analysis-visualization/analysis-contextual-layer';
import Sortable from 'components/sortable';
import { SortableItem } from 'components/sortable/component';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';
import useContextualLayers from 'hooks/layers/getContextualLayers';
import Modal from 'components/modal';
import SandwichIcon from 'components/icons/sandwich';
import { setFilter } from 'store/features/analysis';

import type { Layer, Material } from 'types';

const sortByOrder: (layers: Record<string, Layer>) => Layer[] = (layers) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return Object.values(layers).sort((a, b) => a.order! - b.order!);
};

export const Legend: React.FC = () => {
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const { layers } = useAppSelector(analysisMap);

  const nonContextualLayersNumber = useMemo(
    () => Object.values(layers).filter((layer) => !layer.isContextual).length,
    [layers],
  );

  const { data: layersByCategory, isSuccess: areContextualLayersLoaded } = useContextualLayers({
    onSuccess: (data) => {
      const allLayers = data.flatMap((data) => data.layers);
      allLayers.forEach((layer, i) => {
        dispatch(
          setLayer({
            id: layer.id,
            layer: { ...layer, isContextual: true, order: i + nonContextualLayersNumber },
          }),
        );
      });
    },
  });

  const visibleLayerNumber = useMemo(
    () => Object.values(layers).filter((l) => l.visible).length,
    [layers],
  );
  const visibleContextualLayers = useMemo(
    () =>
      visibleLayerNumber - Object.values(layers).filter((l) => !l.isContextual && l.visible).length,
    [visibleLayerNumber, layers],
  );

  const handleShowLegend = useCallback(() => {
    setShowLegend((show) => !show);
  }, []);

  const handleToggleShowLegendSettings = useCallback(() => {
    setShowSettings((show) => !show);
  }, []);

  const dismissLegendSettings = useCallback(() => setShowSettings(false), []);

  const applyLegendSettings = useCallback(
    ({ layers: newLayers, material }: { layers: Layer[]; material: Material['id'] }) => {
      newLayers.forEach((layer) => {
        const prevLayer = layers[layer.id];
        dispatch(
          setLayer({
            id: layer.id,
            layer: {
              ...layer,
              ...(layer.visible && !prevLayer.visible ? { active: true } : {}),
            },
          }),
        );
      });
      dispatch(setFilter({ id: 'materialId', value: material }));
      setShowSettings(false);
    },
    [dispatch, layers],
  );

  const orderedLayers = useMemo(() => {
    return sortByOrder(layers);
  }, [layers]);

  const LegendToShow = useCallback(
    (layer: Layer) =>
      layer.id === 'impact' ? (
        <ImpactLayer />
      ) : layer.id === 'material' ? (
        <MaterialLayer />
      ) : layer.isContextual ? (
        <ContextualLegendItem layer={layer} />
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
            className={classNames({
              hidden: !layer.visible,
            })}
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
          <div className="absolute bottom-0 z-10 flex flex-col flex-grow overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm right-12 w-[350px] md:max-h-[75vh]">
            <div className="overflow-y-auto">
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between px-2 py-1 place-items-center">
                  <div className="px-2 text-sm text-gray-900">Legend</div>
                  <button
                    disabled={!areContextualLayersLoaded}
                    type="button"
                    aria-expanded={showSettings}
                    className="disabled:cursor-not-allowed disabled:text-gray-500 text-navy-400 py-1.5 px-1.5 flex flex-row gap-2 place-items-center"
                    onClick={handleToggleShowLegendSettings}
                    data-testid="contextual-layer-modal-toggle"
                  >
                    <span className="my-auto text-xs font-semibold underline underline-offset-2">
                      Contextual Layers
                    </span>
                    {visibleContextualLayers > 0 && (
                      <div className="w-4 h-4 text-xs font-semibold text-center text-white rounded-full bg-navy-400">
                        {visibleContextualLayers}
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
          <ToggleShowLegendButton
            showLegend={showLegend}
            toggleLegend={handleShowLegend}
            activeLayerNumber={visibleLayerNumber}
          />
        </div>
      </div>
      <Modal
        size="fit"
        theme="minimal"
        title="Contextual Layers"
        open={showSettings}
        onDismiss={dismissLegendSettings}
      >
        <ContextualLayers
          onApply={applyLegendSettings}
          onDismiss={dismissLegendSettings}
          categories={layersByCategory || []}
        />
      </Modal>
    </>
  );
};

interface ToggleShowLegendButtonProps {
  showLegend: boolean;
  toggleLegend: () => void;
  activeLayerNumber: number;
}

const ToggleShowLegendButton = ({
  showLegend,
  toggleLegend,
  activeLayerNumber,
}: ToggleShowLegendButtonProps) => {
  const bgColorClassnames = showLegend ? 'bg-navy-400 hover:bg-navy-600' : 'bg-white';
  const textColorClassnames = showLegend ? 'text-white' : 'text-black hover:text-navy-400';

  return (
    <button
      type="button"
      className={classNames(
        bgColorClassnames,
        textColorClassnames,
        'transition-colors relative flex items-center justify-center w-10 h-10 rounded-lg p-1.5 ',
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
      {activeLayerNumber > 0 && (
        <div
          className={classNames(
            showLegend ? 'bg-inherit' : 'bg-navy-400',
            'box-content absolute bottom-0 right-0 w-4 h-4 m-auto text-xs font-semibold text-center text-white border border-white rounded-full translate-x-1/3 translate-y-1/3',
          )}
        >
          {activeLayerNumber}
        </div>
      )}
    </button>
  );
};

export default Legend;
