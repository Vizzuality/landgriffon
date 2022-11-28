import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { ChevronDoubleRightIcon } from '@heroicons/react/solid';

import ContextualLegendItem from './contextual-legend-item';
import ImpactLayer from './impact-legend-item';
import LegendSettings from './settings';
import MaterialLayer from './material-legend-item';

import Sortable from 'components/sortable';
import { SortableItem } from 'components/sortable/component';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';
import useContextualLayers from 'hooks/layers/getContextualLayers';
import Modal from 'components/modal';
import SandwichIcon from 'components/icons/sandwich';

import type { Layer } from 'types';

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

  const activeLayerNumber = useMemo(
    () => Object.values(layers).filter((l) => l.active).length,
    [layers],
  );
  const activeContextualLayers = useMemo(
    () =>
      activeLayerNumber - Object.values(layers).filter((l) => !l.isContextual && l.active).length,
    [activeLayerNumber, layers],
  );

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
          <div className="absolute bottom-0 z- flex flex-col flex-grow overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm right-12 w-[350px] md:max-h-[75vh]">
            <div className="overflow-y-auto">
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between px-2 py-1 place-items-center">
                  <div className="px-2 text-sm text-gray-900">Legend</div>
                  <button
                    disabled={!areContextualLayersLoaded}
                    type="button"
                    aria-expanded={showSettings}
                    className="disabled:cursor-not-allowed disabled:text-gray-500 text-navy-400 py-1.5 px-1.5 flex flex-row gap-2 place-items-center"
                    onClick={handleToggleShowLegendSettinngs}
                  >
                    <span className="my-auto text-xs font-semibold underline underline-offset-2">
                      Contextual Layers
                    </span>
                    {activeContextualLayers > 0 && (
                      <div className="w-4 h-4 text-xs font-semibold text-center text-white rounded-full bg-navy-400">
                        {activeContextualLayers}
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
            activeLayerNumber={activeLayerNumber}
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
        <LegendSettings
          onApply={dismissLegendSettings}
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
      {activeLayerNumber && (
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
