import { useCallback } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';

import LegendItem from 'components/legend/item';
import LegendTypeChoropleth from 'components/legend/types/choropleth';

const LAYER_ID = 'impact';

const ImpactLayer = () => {
  const dispatch = useAppDispatch();
  const {
    layers: { impact },
  } = useAppSelector(analysisMap);
  const handleOpacity = useCallback(
    (opacity: number) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { opacity } }));
    },
    [dispatch],
  );

  // TO-DO: add Loading component
  return (
    <LegendItem
      name={impact.legend.name}
      id={impact.legend.id}
      unit={impact.legend.unit}
      opacity={impact.opacity}
      active={impact.active}
      onChangeOpacity={handleOpacity}
      isLoading={impact.loading}
    >
      <LegendTypeChoropleth
        className="text-sm text-gray-500 flex-1"
        min={impact.legend.min}
        items={impact.legend.items}
      />
    </LegendItem>
  );
};

export default ImpactLayer;
