import { useCallback } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';

import LegendItem from 'components/legend/item';
import LegendTypeCategorical from 'components/legend/types/categorical';

const LAYER_ID = 'hdi';

const HdiLegendItem = () => {
  const dispatch = useAppDispatch();
  const {
    layers: { hdi },
  } = useAppSelector(analysisMap);

  const handleActive = useCallback(
    (active) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { ...hdi, active } }));
    },
    [dispatch, hdi],
  );

  const handleOpacity = useCallback(
    (opacity: number) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { opacity } }));
    },
    [dispatch],
  );

  return (
    <LegendItem
      name="Human development index"
      unit={hdi.legend.unit}
      info={hdi.legend.description}
      id={hdi.legend.id}
      opacity={hdi.opacity}
      active={hdi.active}
      onChangeOpacity={handleOpacity}
      onActiveChange={handleActive}
      isLoading={hdi.loading}
    >
      <LegendTypeCategorical className="text-sm text-gray-500 flex-1" items={hdi.legend.items} />
    </LegendItem>
  );
};

export default HdiLegendItem;
