import { useCallback } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';

import Materials from 'containers/analysis-visualization/analysis-filters/materials/component';
import Loading from 'components/loading';
import LegendItem from 'components/legend/item';
import LegendTypeChoropleth from 'components/legend/types/choropleth';

const LAYER_ID = 'material';

const MaterialLegendItem = () => {
  const dispatch = useAppDispatch();
  const {
    layers: { material },
  } = useAppSelector(analysisMap);

  const handleActive = useCallback(
    (active) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { ...material, active } }));
    },
    [dispatch, material],
  );

  const handleOpacity = useCallback(
    (opacity: number) => {
      dispatch(setLayer({ id: 'impact', layer: { opacity } }));
    },
    [dispatch],
  );

  const handleMaterialChange = useCallback(
    (materialSelected) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { ...material, material: materialSelected } }));
    },
    [dispatch, material],
  );

  const isFetching = false;

  return (
    <LegendItem
      name={
        material.active ? (
          <div className="space-y-2 mr-2">
            <div>Material Production {material.material ? `in ${material.year}` : null}</div>
            <Materials
              current={material.material ? [material.material] : null}
              onChange={handleMaterialChange}
              multiple={false}
            />
          </div>
        ) : (
          'Material Production'
        )
      }
      unit={material.legend.unit}
      opacity={material.opacity}
      active={material.active}
      onChangeOpacity={handleOpacity}
      onActiveChange={handleActive}
    >
      {isFetching && <Loading />}
      {!isFetching && !!material.legend?.items?.length && (
        <LegendTypeChoropleth
          className="text-sm text-gray-500 flex-1"
          min={material.legend.min}
          items={material.legend.items}
        />
      )}
    </LegendItem>
  );
};

export default MaterialLegendItem;
