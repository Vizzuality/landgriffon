import { useCallback } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';

import LegendItem from 'components/legend/item';
import LegendTypeCategorical from 'components/legend/types/categorical';

const LAYER_ID = 'water';

const WaterLegendItem = () => {
  const dispatch = useAppDispatch();
  const {
    layers: { water },
  } = useAppSelector(analysisMap);

  const handleActive = useCallback(
    (active) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { ...water, active } }));
    },
    [dispatch, water],
  );

  const handleOpacity = useCallback(
    (opacity: number) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { opacity } }));
    },
    [dispatch],
  );

  console.log(water);

  return (
    <LegendItem
      name="Baseline water stress"
      unit={water.legend.unit}
      info={water.legend.description}
      id={water.legend.id}
      opacity={water.opacity}
      active={water.active}
      onChangeOpacity={handleOpacity}
      onActiveChange={handleActive}
      isLoading={water.loading}
    >
      <LegendTypeCategorical className="text-sm text-gray-500 flex-1" items={water.legend.items} />
    </LegendItem>
  );
};

export default WaterLegendItem;
