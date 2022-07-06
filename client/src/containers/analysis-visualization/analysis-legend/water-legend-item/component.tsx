import { useCallback } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';

import Materials from 'containers/analysis-visualization/analysis-filters/materials/component';
import LegendItem from 'components/legend/item';
import LegendTypeChoropleth from 'components/legend/types/choropleth';

const LAYER_ID = 'water';

const RiskLegendItem = () => {
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

  const handleMaterialChange = useCallback(
    (material) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { ...water, material } }));
    },
    [dispatch, water],
  );

  return (
    <LegendItem
      name={
        water.active ? (
          <div className="space-y-2 mr-2">
            <div>Baseline water stress {water.material ? `in ${water.year}` : null}</div>
            <Materials
              current={water.material ? [water.material] : null}
              onChange={handleMaterialChange}
              multiple={false}
            />
          </div>
        ) : (
          'Baseline water stress'
        )
      }
      unit={water.legend.unit}
      id={water.legend.id}
      opacity={water.opacity}
      active={water.active}
      onChangeOpacity={handleOpacity}
      onActiveChange={handleActive}
      isLoading={water.loading}
    >
      <LegendTypeChoropleth
        className="text-sm text-gray-500 flex-1"
        min={water.legend.min}
        items={water.legend.items}
      />
    </LegendItem>
  );
};

export default RiskLegendItem;
