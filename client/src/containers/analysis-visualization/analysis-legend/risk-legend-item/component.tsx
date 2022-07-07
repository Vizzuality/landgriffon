import { useCallback } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';

import Materials from 'containers/analysis-visualization/analysis-filters/materials/component';
import LegendItem from 'components/legend/item';
import LegendTypeChoropleth from 'components/legend/types/choropleth';

const LAYER_ID = 'risk';

const RiskLegendItem = () => {
  const dispatch = useAppDispatch();
  const {
    layers: { risk },
  } = useAppSelector(analysisMap);

  const handleActive = useCallback(
    (active) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { ...risk, active } }));
    },
    [dispatch, risk],
  );

  const handleOpacity = useCallback(
    (opacity: number) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { opacity } }));
    },
    [dispatch],
  );

  const handleMaterialChange = useCallback(
    (material) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { ...risk, material } }));
    },
    [dispatch, risk],
  );

  return (
    <LegendItem
      name={
        risk.active ? (
          <div className="space-y-2 mr-2">
            <div>Risk {risk.material ? `in ${risk.year}` : null}</div>
            <Materials
              current={risk.material ? [risk.material] : null}
              onChange={handleMaterialChange}
              multiple={false}
            />
          </div>
        ) : (
          'Risk'
        )
      }
      info="The risk layer displayed on the map reflects the environmental impact associated with the provision of a product or service."
      unit={risk.legend.unit}
      id={risk.legend.id}
      opacity={risk.opacity}
      active={risk.active}
      onChangeOpacity={handleOpacity}
      onActiveChange={handleActive}
      isLoading={risk.loading}
    >
      <LegendTypeChoropleth
        className="text-sm text-gray-500 flex-1"
        min={risk.legend.min}
        items={risk.legend.items}
      />
    </LegendItem>
  );
};

export default RiskLegendItem;
