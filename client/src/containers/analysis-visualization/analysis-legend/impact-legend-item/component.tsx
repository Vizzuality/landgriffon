import { useCallback, useMemo } from 'react';

import { useAppSelector, useAppDispatch, useSyncIndicators } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';
import { scenarios } from 'store/features/analysis';
import LegendTypeChoropleth from 'components/legend/types/choropleth';
import LegendTypeComparative from 'components/legend/types/comparative';
import LegendItem from 'components/legend/item';
import { useIndicator } from 'hooks/indicators';

import type { Legend } from 'types';

const LAYER_ID = 'impact';

const ImpactLayer = () => {
  const dispatch = useAppDispatch();
  const [syncedIndicators] = useSyncIndicators();

  const { data: indicator } = useIndicator(syncedIndicators?.[0], {
    enabled: Boolean(syncedIndicators?.[0]),
  });

  const {
    layers: { [LAYER_ID]: layer },
  } = useAppSelector(analysisMap);

  const handleOpacity = useCallback(
    (opacity: number) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { opacity } }));
    },
    [dispatch],
  );

  const legendItems = useMemo<Legend['items']>(
    () =>
      layer.metadata?.legend?.items?.map((item) => ({
        ...item,
        label: item.label || `${item.value}`,
      })) || [],
    [layer.metadata?.legend.items],
  );

  const { isComparisonEnabled } = useAppSelector(scenarios);

  const name = useMemo(() => {
    if (!layer.metadata?.legend?.name) return null;

    if (isComparisonEnabled) {
      return `Difference in ${layer.metadata.legend.name}`;
    }

    return layer.metadata.legend.name;
  }, [isComparisonEnabled, layer.metadata?.legend]);

  const onToggleLayer = useCallback(
    (active: boolean) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { active } }));
    },
    [dispatch],
  );

  if (!layer.metadata) return null;
  // TODO: add Loading component

  return (
    <LegendItem
      isActive={layer.active}
      onToggle={onToggleLayer}
      info={{
        source: indicator?.metadata?.source,
        description: indicator?.metadata?.description,
        title: name,
      }}
      {...layer.metadata.legend}
      name={name}
      opacity={layer.opacity}
      onChangeOpacity={handleOpacity}
      showComparisonModeToggle
      isLoading={layer.loading}
      main
    >
      {isComparisonEnabled ? (
        <LegendTypeComparative
          className="flex-1 text-sm text-gray-500"
          min={layer.metadata.legend.min}
          items={legendItems}
        />
      ) : (
        <LegendTypeChoropleth
          className="flex-1 text-sm text-gray-500"
          min={layer.metadata.legend.min}
          items={legendItems}
        />
      )}
    </LegendItem>
  );
};

export default ImpactLayer;
