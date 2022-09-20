import { useCallback, useMemo } from 'react';
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

import { NUMBER_FORMAT } from 'utils/number-format';
import LegendChart from './legend';

import type { ImpactRanking } from 'types';

type StackedAreaChartProps = {
  data: ImpactRanking;
};

const COLOR_SCALE = chroma.scale(['#2D7A5B', '#39A163', '#9AC864', '#D9E77F', '#FFF9C7']);

const StackedAreaChart: React.FC<StackedAreaChartProps> = ({ data }) => {
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

  const renderLegend = useCallback((props) => {
    return <LegendChart {...props} />;
  }, []);

  return (
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
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
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
              />
              <YAxis
                axisLine={false}
                label={{ value: chartData.unit, angle: -90, position: 'insideLeft' }}
                tick={{ fill: '#15181F', fontWeight: 300 }}
                tickLine={false}
                tickFormatter={NUMBER_FORMAT}
              />
              <Tooltip
                formatter={NUMBER_FORMAT}
                animationDuration={500}
                itemStyle={{ color: '#15181F' }}
              />
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
      </div>
    </div>
  );
};

export default StackedAreaChart;
