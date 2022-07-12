import { useEffect, useCallback } from 'react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';
import {
  analysisMap,
  setLayer,
  setTooltipData,
  setTooltipPosition,
} from 'store/features/analysis/map';

import { useH3MaterialData } from 'hooks/h3-data';
import { useYears } from 'hooks/years';

import { NUMBER_FORMAT } from 'utils/number-format';
import { COLOR_RAMPS } from 'utils/colors';

import type { LegendItem as LegendItemProp } from 'types';

const LAYER_ID = 'material'; // should match with redux

export const useMaterialLayer: () => ReturnType<typeof useH3MaterialData> & {
  layer: H3HexagonLayer;
} = () => {
  const dispatch = useAppDispatch();
  const { indicator } = useAppSelector(analysisFilters);
  const {
    layers: { material: materialLayer },
  } = useAppSelector(analysisMap);
  const years = useYears(
    'material',
    materialLayer.material ? [materialLayer.material] : [],
    indicator,
  );
  const params = {
    year: years.data && years.data[0],
    materialId: materialLayer.material && materialLayer.material.value,
  };
  const options = {
    enabled: !!(materialLayer.active && materialLayer.material && materialLayer.year),
  };
  const query = useH3MaterialData(params, options);
  const { data } = query;

  const handleHover = useCallback(
    ({ object, x, y, viewport }) => {
      dispatch(
        setTooltipPosition({
          x,
          y,
          viewport: viewport ? { width: viewport.width, height: viewport.height } : null,
        }),
      );
      dispatch(
        setTooltipData({
          id: LAYER_ID,
          name: 'Material',
          value: object?.v,
          unit: data.metadata?.unit,
        }),
      );
    },
    [data.metadata?.unit, dispatch],
  );

  const layer = new H3HexagonLayer({
    id: LAYER_ID,
    data: data.data,
    wireframe: false,
    filled: true,
    stroked: true,
    extruded: false,
    highPrecision: 'auto',
    pickable: true,
    coverage: 0.9,
    lineWidthMinPixels: 2,
    opacity: materialLayer.opacity,
    visible: materialLayer.active,
    getHexagon: (d) => d.h,
    getFillColor: (d) => d.c,
    getLineColor: (d) => d.c,
    onHover: handleHover,
  });

  // Populating legend
  useEffect(() => {
    if (data && indicator) {
      dispatch(
        setLayer({
          id: LAYER_ID,
          layer: {
            loading: query.isFetching,
            year: years.data && years.data[0],
            legend: {
              id: LAYER_ID,
              name: `${indicator.label} in ${years.data[0]}`,
              unit: data.metadata.unit,
              min: data.metadata.quantiles[0] && NUMBER_FORMAT(data.metadata.quantiles[0]),
              items: data.metadata.quantiles.slice(1).map(
                (v, index): LegendItemProp => ({
                  value: NUMBER_FORMAT(v),
                  color: COLOR_RAMPS[LAYER_ID][index],
                }),
              ),
            },
          },
        }),
      );
    }
  }, [data, dispatch, indicator, query.isFetching, years.data]);

  return {
    ...query,
    layer,
  };
};
