import { useEffect, useCallback } from 'react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';
import {
  analysisMap,
  setLayer,
  setTooltipPosition,
  setTooltipData,
} from 'store/features/analysis/map';

import { useH3RiskData } from 'hooks/h3-data';
import { useYears } from 'hooks/years';

import { NUMBER_FORMAT } from 'utils/number-format';
import { COLOR_RAMPS } from 'utils/colors';

import type { LegendItem as LegendItemProp } from 'types';

const LAYER_ID = 'risk'; // should match with redux
// const HEXAGON_HIGHLIGHT_COLOR = [0, 0, 0];

export const useRiskLayer: () => ReturnType<typeof useH3RiskData> & { layer: H3HexagonLayer } =
  () => {
    const dispatch = useAppDispatch();
    const { indicator } = useAppSelector(analysisFilters);
    const {
      layers: { risk: riskLayer },
    } = useAppSelector(analysisMap);
    const years = useYears('risk', riskLayer.material ? [riskLayer.material] : [], indicator);
    const params = {
      year: years.data && years.data[0],
      materialId: riskLayer.material && riskLayer.material.value,
      indicatorId: indicator?.value,
    };
    const options = {
      enabled: !!(riskLayer.active && riskLayer.material && riskLayer.year && indicator),
    };
    const query = useH3RiskData(params, options);
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
            name: 'Risk',
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
      opacity: riskLayer.opacity,
      visible: riskLayer.active,
      getHexagon: (d) => d.h,
      getFillColor: (d) => d.c,
      // getElevation: (d) => d.v,
      getLineColor: (d) => d.c,
      // getLineColor: (d) => (d.h === hoveredHexagon ? HEXAGON_HIGHLIGHT_COLOR : d.c),
      onHover: handleHover,
      // updateTriggers: {
      //   getLineColor: hoveredHexagon,
      // },
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
                min: !!data.metadata.quantiles.length && NUMBER_FORMAT(data.metadata.quantiles[0]),
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
