import { useCallback } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';

import Materials from 'containers/analysis-visualization/analysis-filters/materials/component';
import LegendItem from 'components/legend/item';
import LegendTypeChoropleth from 'components/legend/types/choropleth';

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

  const handleMaterialChange = useCallback(
    (material) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { ...hdi, material } }));
    },
    [dispatch, hdi],
  );

  return (
    <LegendItem
      name={
        hdi.active ? (
          <div className="space-y-2 mr-2">
            <div>Human development index</div>
            <Materials
              current={hdi.material ? [hdi.material] : null}
              onChange={handleMaterialChange}
              multiple={false}
            />
          </div>
        ) : (
          'Human development index'
        )
      }
      unit={hdi.legend.unit}
      id={hdi.legend.id}
      opacity={hdi.opacity}
      active={hdi.active}
      onChangeOpacity={handleOpacity}
      onActiveChange={handleActive}
      isLoading={hdi.loading}
    >
      <LegendTypeChoropleth
        className="text-sm text-gray-500 flex-1"
        min={hdi.legend.min}
        items={hdi.legend.items}
      />
    </LegendItem>
  );
};

export default HdiLegendItem;
