import { useCallback, useMemo } from 'react';
import omit from 'lodash/omit';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis/scenarios';
import { filtersForTabularAPI } from 'store/features/analysis/selector';
import { useImpactComparison } from 'hooks/impact/comparison';

import Loading from 'components/loading';
import { NUMBER_FORMAT } from 'utils/number-format';
import CustomLegend from './legend';
import CustomTooltip from './tooltip';

import type { Indicator } from 'types';
import { ACTUAL_DATA } from 'containers/scenarios/constants';

type StackedAreaChartProps = {
  indicator: Indicator;
};

type ChartData = {
  name: string;
  unit: string;
  values: {
    year: number;
    value: number;
    scenarioValue: number;
    absoluteDifference: number;
    percentageDifference: number;
  }[];
};

const StackedAreaChart: React.FC<StackedAreaChartProps> = ({ indicator }) => {
  const { scenarioToCompare } = useAppSelector(scenarios);
  const filters = useAppSelector(filtersForTabularAPI);

  const params = {
    ...omit(filters, 'indicatorId'),
    indicatorIds: [indicator.id],
    scenarioId: scenarioToCompare === ACTUAL_DATA.id ? undefined : scenarioToCompare,
    disabledPagination: true,
  };

  const enabled =
    !!filters?.indicatorId &&
    !!filters.startYear &&
    !!filters.endYear &&
    filters.endYear !== filters.startYear;

  const { data, isFetched, isLoading } = useImpactComparison(params, { enabled });

  const chartData = useMemo<ChartData>(() => {
    const { indicatorShortName, yearSum, metadata } = data?.data?.impactTable?.[0] || {};

    return {
      values: yearSum,
      name: indicatorShortName,
      unit: metadata?.unit,
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
      {isLoading && <Loading className="w-5 h-5 m-auto text-primary" />}
      {!isLoading && isFetched && data && (
        <div>
          <h2 className="flex-shrink-0 text-base">
            {chartData.name} ({chartData.unit})
          </h2>
          <div className="relative flex-grow mt-3">
            <div className="h-[370px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData.values}
                  margin={{
                    top: 0,
                    right: 20,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <Legend verticalAlign="top" content={renderLegend} height={70} />
                  <CartesianGrid
                    stroke="#15181F"
                    strokeWidth={1}
                    strokeOpacity={0.15}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tick={{ fill: '#15181F', fontWeight: 300 }}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    axisLine={false}
                    domain={['auto', 'auto']}
                    label={{ value: chartData.unit, angle: -90, position: 'insideLeft' }}
                    tick={{ fill: '#15181F', fontWeight: 300 }}
                    tickLine={false}
                    tickFormatter={NUMBER_FORMAT}
                  />
                  <Tooltip animationDuration={500} content={renderTooltip} />
                  {/* Actual data */}
                  <Line
                    animationEasing="ease"
                    animationDuration={500}
                    dataKey="value"
                    stroke="#AEB1B5"
                    strokeWidth={2}
                    type="linear"
                  />
                  {/* Scenario */}
                  <Line
                    animationEasing="ease"
                    animationDuration={500}
                    dataKey="scenarioValue"
                    fillOpacity={0.9}
                    stroke="#3F59E0"
                    strokeWidth={2}
                    type="linear"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StackedAreaChart;
