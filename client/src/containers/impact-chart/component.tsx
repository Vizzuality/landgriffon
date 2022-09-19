import { useCallback, useMemo } from 'react';
import { useStore } from 'react-redux';
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
import { useImpactRanking } from 'hooks/impact';

import LegendChart from 'components/chart/legend';
import Loading from 'components/loading';
import { NUMBER_FORMAT } from 'utils/number-format';

import type { Store } from 'store';
import type { Indicator } from 'types';

type ImpactChartProps = {
  indicator: Indicator;
};

const COLOR_SCALE = chroma.scale(['#2D7A5B', '#39A163', '#9AC864', '#D9E77F', '#FFF9C7']);

const ImpactChart: React.FC<ImpactChartProps> = ({ indicator }) => {
  const store: Store = useStore();
  const filters = filtersForTabularAPI(store.getState());

  console.log(filters);

  const params = {
    maxRankingEntities: 5,
    sort: 'DES',
    ...omit(filters, 'indicatorId'),
    indicatorIds: [indicator.id],
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
      });
      result.push({ date: year, ...items });
    });

    if (result?.[0]) {
      Object.keys(result[0]).forEach((key) => key !== 'date' && keys.push(key));
    }

    const colorScale = COLOR_SCALE.colors(keys.length);

    return {
      data: result,
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

  const renderLegend = useCallback((props) => {
    return <LegendChart {...props} />;
  }, []);

  return (
    <div className="p-6 bg-white rounded-md shadow-sm">
      {isLoading && <Loading className="w-5 h-5 m-auto text-primary" />}
      {!isLoading && isFetched && chartData && (
        <div>
          <h2 className="flex-shrink-0 text-base">
            {chartData.name} ({chartData.unit})
          </h2>
          <div className="relative flex-grow mt-3">
            {chartData && (
              <div className="h-[370px] text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData.data}
                    margin={{
                      top: 0,
                      right: 0,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <Legend verticalAlign="top" content={renderLegend} height={70} />
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis
                      axisLine={false}
                      label={{ value: chartData.unit, angle: -90, position: 'insideLeft' }}
                      tickLine={false}
                      tickFormatter={NUMBER_FORMAT}
                    />
                    <Tooltip />
                    {chartData.keys.map((key) => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stackId="1"
                        stroke={chartData.colors[key]}
                        strokeWidth={0}
                        fill={chartData.colors[key]}
                        fillOpacity={0.9}
                        animationEasing="ease"
                        animationDuration={500}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactChart;
