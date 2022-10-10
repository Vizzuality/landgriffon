import { useCallback, useMemo } from 'react';
import omit from 'lodash/omit';
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

import { filtersForTabularAPI } from 'store/features/analysis/selector';
import { useImpactRanking } from 'hooks/impact/ranking';
import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis';

import Loading from 'components/loading';
import { NUMBER_FORMAT } from 'utils/number-format';
import CustomLegend from './legend';
import CustomTooltip from './tooltip';

import type { Indicator } from 'types';

type StackedAreaChartProps = {
  indicator: Indicator;
};

const COLOR_SCALE = chroma.scale(['#2D7A5B', '#39A163', '#9AC864', '#D9E77F', '#FFF9C7']);

const StackedAreaChart: React.FC<StackedAreaChartProps> = ({ indicator }) => {
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

  const { data, isFetched, isLoading } = useImpactRanking(
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
    const { indicatorShortName, rows, yearSum, metadata } = data?.impactTable?.[0] || {};
    const result = [];
    const keys = [];

    yearSum?.forEach(({ year }) => {
      const items = {};
      rows?.forEach((row) => {
        const yearValues = row?.values.find((rowValues) => rowValues?.year === year);
        items[row.name] = yearValues?.value;
        if (yearValues.isProjected) {
          items[`projected-${row.name}`] = yearValues?.value;
        }
      });
      result.push({ date: year, ...items });
    });

    if (result?.[0]) {
      Object.keys(result[0]).forEach((key) => key !== 'date' && keys.push(key));
    }

    const colorScale = COLOR_SCALE.colors(keys.length);

    return {
      values: result,
      keys,
      name: indicatorShortName,
      unit: metadata?.unit,
      colors: keys.reduce(
        (acc, k, i) => ({
          ...acc,
          [k]: k === 'Other' || k === 'Others' ? '#E4E4E4' : colorScale[i],
        }),
        {},
      ),
    };
  }, [data]);

  const renderLegend = useCallback((props) => <CustomLegend {...props} />, []);

  const renderTooltip = useCallback((props) => {
    if (props && props.active && props.payload && props.payload.length) {
      return <CustomTooltip {...props} />;
    }
  }, []);

  return (
    <div className="p-6 bg-white rounded-md shadow-sm">
      {isLoading && <Loading className="w-5 h-5 m-auto text-navy-400" />}
      {!isLoading && isFetched && data && (
        <div>
          <h2 className="flex-shrink-0 text-base">
            {chartData.name} ({chartData.unit})
          </h2>
          <div className="relative flex-grow mt-3">
            <div className="h-[370px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData.values}
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
                  <Legend verticalAlign="top" content={renderLegend} height={70} />
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
                    tickFormatter={NUMBER_FORMAT}
                  />
                  <Tooltip<number, string>
                    animationDuration={500}
                    contentStyle={{ borderRadius: '8px', borderColor: '#D1D5DB' }}
                    content={renderTooltip}
                  />
                  {chartData.keys.map((key) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stackId="all"
                      stroke={chartData.colors[key]}
                      strokeWidth={0}
                      fill={chartData.colors[key]}
                      fillOpacity={0.9}
                      animationEasing="ease"
                      animationDuration={500}
                    />
                  ))}
                  {chartData.keys.map((key) => (
                    <Area
                      key={`projected-${key}`}
                      type="monotone"
                      dataKey={`projected-${key}`}
                      stackId="projected"
                      stroke={chartData.colors[key]}
                      strokeWidth={0}
                      fill="url(#patternStripe)"
                      animationEasing="ease"
                      animationDuration={500}
                      tooltipType="none"
                      legendType="none"
                    />
                  ))}
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
