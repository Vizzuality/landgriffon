import { useCallback, useMemo } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';
import { analysisFilters, scenarios } from 'store/features/analysis';
import LegendTypeChoropleth from 'components/legend/types/choropleth';
import LegendTypeComparative from 'components/legend/types/comparative';
import LegendItem from 'components/legend/item';
import { useIndicator } from 'hooks/indicators';

import type { Legend } from 'types';

const LAYER_ID = 'impact';

const ImpactLayer = () => {
  const dispatch = useAppDispatch();
  const { indicator: indicatorOption } = useAppSelector(analysisFilters);

  const { data: indicator } = useIndicator(indicatorOption?.value);

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

  if (!layer.metadata) return null;
  // TO-DO: add Loading component
  return (
    <LegendItem
      info={indicator?.metadata?.description}
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
