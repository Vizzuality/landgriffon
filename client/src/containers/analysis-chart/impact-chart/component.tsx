import { useCallback, useEffect, useMemo, useState } from 'react';
import omit from 'lodash-es/omit';
import chroma from 'chroma-js';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import CustomLegend from './legend';
import CustomTooltip from './tooltip';

import { filtersForTabularAPI } from 'store/features/analysis/selector';
import { useImpactRanking } from 'hooks/impact/ranking';
import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis';
import Loading from 'components/loading';
import { formatNumber } from 'utils/number-format';

import type { ExtendedLegendProps } from './legend/component';
import type { Indicator } from 'types';

type StackedAreaChartProps = {
  indicator: Indicator;
};

const COLORS = ['#1C44C3', '#5DBCC5', '#ED8F23', '#3D8CE7', '#E2564F'];
const COLOR_SCALE = chroma.scale(COLORS);

const defaultOpacity = 1;

const StackedAreaChart: React.FC<StackedAreaChartProps> = ({ indicator }) => {
  const [legendKey, setLegendKey] = useState<string | null>(null);

  const filters = useAppSelector(filtersForTabularAPI);
  const { currentScenario: scenarioId } = useAppSelector(scenarios);

  const params = {
    maxRankingEntities: 5,
    sort: 'DES',
    ...omit(filters, 'indicatorId'),
    indicatorIds: [indicator.id],
    scenarioId,
  };

  const enabled =
    !!filters?.indicatorId &&
    !!filters.startYear &&
    !!filters.endYear &&
    filters.endYear !== filters.startYear;

  const { data, isFetched, isFetching } = useImpactRanking(
    {
      maxRankingEntities: 5,
      sort: 'DES',
      ...params,
    },
    {
      enabled,
    },
  );

  const chartData = useMemo(() => {
    const {
      indicatorShortName,
      rows,
      yearSum,
      metadata,
      others = {},
    } = data?.impactTable?.[0] || {};

    const { numberOfAggregatedEntities, aggregatedValues } = others;
    const result = [];
    const keys = [];
    let opacities = {};

    yearSum?.forEach(({ year }) => {
      const items = {};

      rows?.forEach((row) => {
        const yearValues = row?.values.find((rowValues) => rowValues?.year === year);
        items[row.name] = yearValues?.value;
        opacities = { ...opacities, [row.name]: 0.9 };
        if (yearValues.isProjected) {
          items[`projected-${row.name}`] = yearValues?.value;
        }
      });

      if (numberOfAggregatedEntities && numberOfAggregatedEntities > 0) {
        items['Others'] = aggregatedValues?.find(
          (aggregatedValue) => aggregatedValue?.year === year,
        )?.value;
        opacities = { ...opacities, Others: 0.9 };
      }
      result.push({ date: year, ...items });
    });

    if (result.length > 0) {
      Object.keys(result[0]).forEach((key) => key !== 'date' && keys.push(key));
    }

    const colorScale =
      keys.filter((k) => k !== 'Others').length > COLORS.length
        ? COLOR_SCALE.colors(keys.length)
        : COLORS;

    return {
      values: result,
      keys: keys.filter((key) => key !== 'date' && !key.startsWith('projected-')),
      name: indicatorShortName,
      unit: metadata?.unit,
      colors: keys.reduce(
        (acc, k, i) => ({
          ...acc,
          [k]: k === 'Other' || k === 'Others' ? '#E4E4E4' : colorScale[i],
        }),
        {},
      ),
      opacities,
    };
  }, [data]);

  const subchartData = useMemo(() => {
    const {
      indicatorShortName,
      rows,
      yearSum,
      metadata,
      others = {},
    } = data?.impactTable?.[0] || {};

    const { numberOfAggregatedEntities, aggregatedValues } = others;
    const result = [];
    const keys = [];
    let opacities = {};

    const LEGEND_INDEX = rows?.findIndex((row) => row.name === legendKey);

    yearSum?.forEach(({ year }) => {
      const items = {};

      const LEGEND_ROW = rows?.find((row) => row.name === legendKey);

      if (legendKey === 'Others' && numberOfAggregatedEntities && numberOfAggregatedEntities > 0) {
        result.push({
          date: year,
          Others: aggregatedValues?.find((aggregatedValue) => aggregatedValue?.year === year)
            ?.value,
          ...(aggregatedValues?.isProjected && {
            [`projected-${LEGEND_ROW.name}`]: aggregatedValues?.value,
          }),
        });
      }
      if (!LEGEND_ROW) return [];

      if (!LEGEND_ROW?.children.length) {
        const yearValues = LEGEND_ROW?.values.find((rowValues) => rowValues?.year === year);

        result.push({
          date: year,
          [LEGEND_ROW.name]: yearValues?.value,
          ...(yearValues?.isProjected && {
            [`projected-${LEGEND_ROW.name}`]: yearValues?.value,
          }),
        });
      }

      if (LEGEND_ROW?.children.length) {
        LEGEND_ROW.children?.forEach((row) => {
          const yearValues = row?.values.find((rowValues) => rowValues?.year === year);
          items[row.name] = yearValues?.value;
          opacities = { ...opacities, [row.name]: 0.9 };
          if (yearValues.isProjected) {
            items[`projected-${row.name}`] = yearValues?.value;
          }
        });

        result.push({ date: year, ...items });
      }
    });

    if (result.length > 0) {
      Object.keys(result[0]).forEach((key) => key !== 'date' && keys.push(key));
    }

    const c = COLORS[LEGEND_INDEX] || '#1C44C3';
    const SUB_COLOR_SCALE = chroma.scale([c, chroma(c).brighten(3)]);

    const colorScale = SUB_COLOR_SCALE.colors(keys.length);

    return {
      values: result,
      keys: keys.filter((key) => key !== 'date' && !key.startsWith('projected-')),
      name: indicatorShortName,
      unit: metadata?.unit,
      colors: keys.reduce(
        (acc, k, i) => ({
          ...acc,
          [k]: k === 'Other' || k === 'Others' ? '#E4E4E4' : colorScale[i],
        }),
        {},
      ),
      opacities,
    };
  }, [data, legendKey]);

  const CHART_DATA = legendKey ? subchartData : chartData;

  /**
   * Toggle legend opacity
   */
  const handleLegendClick = useCallback(
    (obj) => {
      const { id } = obj;

      if (legendKey === id) {
        setLegendKey(null);
        return;
      }

      setLegendKey(id);
    },
    [legendKey],
  );

  useEffect(() => {
    setLegendKey(null);
  }, [filters]);

  const renderLegend = useCallback(
    (props: ExtendedLegendProps) => <CustomLegend {...props} legendKey={legendKey} />,
    [legendKey],
  );

  const renderTooltip = useCallback((props) => {
    if (props && props.active && props.payload && props.payload.length) {
      return <CustomTooltip {...props} />;
    }
  }, []);

  return (
    <div className="rounded-md bg-white p-6 shadow-sm" data-testid="analysis-chart">
      {isFetching && <Loading className="m-auto h-5 w-5 text-navy-400" />}
      {!data && !isFetching && (
        <div className="flex h-[370px] flex-col items-center justify-center">No data</div>
      )}
      {!isFetching && isFetched && data && (
        <div>
          <h2 className="flex-shrink-0 text-base">
            {chartData.name} ({chartData.unit})
          </h2>
          <div className="relative mt-3 flex-grow">
            <div className="h-[370px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  key={legendKey}
                  data={CHART_DATA.values}
                  margin={{
                    top: 0,
                    right: 20,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <pattern
                      id="patternStripe"
                      width="4"
                      height="4"
                      patternUnits="userSpaceOnUse"
                      patternTransform="rotate(45)"
                    >
                      <rect
                        width="1"
                        height="4"
                        transform="translate(0,0)"
                        fill="#15181F"
                        fillOpacity={0.5}
                      ></rect>
                    </pattern>
                  </defs>

                  <Legend
                    verticalAlign="top"
                    content={renderLegend}
                    height={90}
                    payload={chartData.keys.map((key) => ({
                      id: key,
                      value: key,
                      color: chartData.colors[key],
                      fillOpacity: chartData.opacities[key],
                    }))}
                    onClick={handleLegendClick}
                  />

                  <CartesianGrid
                    vertical={false}
                    stroke="#15181F"
                    strokeWidth={1}
                    strokeOpacity={0.15}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tick={{ fill: '#15181F', fontWeight: 300 }}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    axisLine={false}
                    label={{ value: chartData.unit, angle: -90, position: 'insideLeft' }}
                    tick={{ fill: '#15181F', fontWeight: 300 }}
                    tickLine={false}
                    tickFormatter={formatNumber}
                  />

                  {CHART_DATA.keys.map((key) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stackId="all"
                      stroke={CHART_DATA.colors[key]}
                      strokeWidth={0}
                      fill={CHART_DATA.colors[key]}
                      fillOpacity={defaultOpacity}
                      animationEasing="ease"
                      animationDuration={500}
                      opacity={defaultOpacity}
                    />
                  ))}
                  {CHART_DATA.keys.map((key) => (
                    <Area
                      key={`projected-${key}`}
                      type="monotone"
                      dataKey={`projected-${key}`}
                      stackId="projected"
                      stroke={CHART_DATA.colors[key]}
                      strokeWidth={0}
                      fill="url(#patternStripe)"
                      fillOpacity={defaultOpacity}
                      animationEasing="ease"
                      animationDuration={500}
                      tooltipType="none"
                      legendType="none"
                    />
                  ))}
                  <Tooltip<number, string>
                    animationDuration={500}
                    contentStyle={{ borderRadius: '8px', borderColor: '#D1D5DB' }}
                    wrapperStyle={{ zIndex: 1000 }}
                    content={renderTooltip}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StackedAreaChart;
