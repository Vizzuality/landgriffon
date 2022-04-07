import { useCallback, useMemo } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';
import { analysisMap, setLayer } from 'store/features/analysis/map';

import { useH3MaterialData } from 'hooks/h3-data';

import Materials from 'containers/analysis-visualization/analysis-filters/materials';
import Loading from 'components/loading';
import LegendItem from 'components/legend/item';
import LegendTypeChoropleth from 'components/legend/types/choropleth';

import { COLOR_RAMPS, NUMBER_FORMAT } from '../../constants';

import type { Legend, LegendItem as LegendItemProp } from 'types';

const MaterialLegendItem = () => {
  const dispatch = useAppDispatch();
  const { indicator, startYear } = useAppSelector(analysisFilters);
  const {
    layers: { material },
  } = useAppSelector(analysisMap);

  const { data, isFetching } = useH3MaterialData();

  const legendData = useMemo<Legend>(() => {
    if (indicator?.label && data) {
      return {
        name: `${indicator.label} in ${startYear}`,
        unit: data.metadata.unit,
        min: NUMBER_FORMAT(data.metadata.quantiles[0]),
        items: data.metadata.quantiles.slice(1).map(
          (v, index): LegendItemProp => ({
            value: NUMBER_FORMAT(v),
            color: COLOR_RAMPS['impact'][index],
          }),
        ),
      };
    }
    return null;
  }, [data, indicator?.label, startYear]);

  const handleActive = useCallback(
    (active) => {
      dispatch(setLayer({ id: 'material', layer: { ...material, active } }));
    },
    [dispatch, material],
  );

  return (
    <LegendItem {...legendData} name={<Materials />} onActiveChange={handleActive}>
      {isFetching && <Loading />}
      {legendData && (
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
