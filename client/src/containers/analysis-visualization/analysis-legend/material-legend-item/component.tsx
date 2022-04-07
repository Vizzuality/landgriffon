import { useCallback, useMemo } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';

import { useH3MaterialData } from 'hooks/h3-data';

import Materials from 'containers/analysis-visualization/analysis-filters/materials/component';
import Loading from 'components/loading';
import LegendItem from 'components/legend/item';
import LegendTypeChoropleth from 'components/legend/types/choropleth';

import { COLOR_RAMPS, NUMBER_FORMAT } from '../../constants';

import type { Legend, LegendItem as LegendItemProp } from 'types';

const LAYER_ID = 'material';

const MaterialLegendItem = () => {
  const dispatch = useAppDispatch();
  const {
    layers: { material },
  } = useAppSelector(analysisMap);

  const { data, isFetching } = useH3MaterialData();

  const legendData = useMemo<Legend>(() => {
    if (data) {
      return {
        name: null,
        unit: data.metadata.unit,
        min: NUMBER_FORMAT(data.metadata.quantiles[0]),
        items: data.metadata.quantiles.slice(1).map(
          (v, index): LegendItemProp => ({
            value: NUMBER_FORMAT(v),
            color: COLOR_RAMPS[LAYER_ID][index],
          }),
        ),
      };
    }
    return null;
  }, [data]);

  const handleActive = useCallback(
    (active) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { ...material, active } }));
    },
    [dispatch, material],
  );

  const handleMaterialChange = useCallback(
    (materialSelected) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { ...material, material: materialSelected } }));
    },
    [dispatch, material],
  );

  return (
    <LegendItem
      {...legendData}
      name={
        material.active ? (
          <Materials
            current={material.material ? [material.material] : null}
            onChange={handleMaterialChange}
            multiple={false}
          />
        ) : (
          'Material Production'
        )
      }
      onActiveChange={handleActive}
    >
      {isFetching && <Loading />}
      {!isFetching && !!legendData?.items?.length && (
        <LegendTypeChoropleth
          className="text-sm text-gray-500 flex-1"
          min={legendData.min}
          items={legendData.items}
        />
      )}
    </LegendItem>
  );
};

export default MaterialLegendItem;
