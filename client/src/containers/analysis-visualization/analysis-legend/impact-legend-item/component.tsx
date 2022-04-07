import { useMemo } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';
import { setLayer } from 'store/features/analysis/map';

import { useH3ImpactData } from 'hooks/h3-data';

import Loading from 'components/loading';
import LegendItem from 'components/legend/item';
import LegendTypeChoropleth from 'components/legend/types/choropleth';

import { COLOR_RAMPS, NUMBER_FORMAT } from '../../constants';

import type { Legend, LegendItem as LegendItemProp } from 'types';

const LAYER_ID = 'impact';

const ImpactLayer = () => {
  const dispatch = useAppDispatch();
  const { indicator, startYear } = useAppSelector(analysisFilters);
  const { data, isFetching } = useH3ImpactData();

  const legendData = useMemo<Legend>(() => {
    if (indicator?.label && data) {
      return {
        name: `${indicator.label} in ${startYear}`,
        unit: data.metadata.unit,
        min: NUMBER_FORMAT(data.metadata.quantiles[0]),
        items: data.metadata.quantiles.slice(1).map(
          (v, index): LegendItemProp => ({
            value: NUMBER_FORMAT(v),
            color: COLOR_RAMPS[LAYER_ID][index],
          }),
        ),
        active: true, // this layer is always active
      };
    }
    return null;
  }, [data, indicator?.label, startYear]);

  return (
    <LegendItem {...legendData} showToggle={false}>
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

export default ImpactLayer;
