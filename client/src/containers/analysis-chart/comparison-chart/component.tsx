import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { omit } from 'lodash-es';
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

import CustomLegend from './legend';
import CustomTooltip from './tooltip';

import { useAppSelector } from 'store/hooks';
import { filtersForTabularAPI } from 'store/features/analysis/selector';
import { useImpactComparison } from 'hooks/impact/comparison';
import Loading from 'components/loading';
import { NUMBER_FORMAT } from 'utils/number-format';

import type { Indicator } from 'types';
import type { ImpactComparisonParams } from 'hooks/impact/comparison';

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
    isProjected: boolean;
  }[];
};

const defaultOpacity = 0.9;
const alternativeOpacity = 0.4;

const StackedAreaChart: React.FC<StackedAreaChartProps> = ({ indicator }) => {
  const router = useRouter();
  const { scenarioId, compareScenarioId } = router.query || {};

  const [itemOpacity, setItemOpacity] = useState<Record<string, number>>({});

  const filters = useAppSelector(filtersForTabularAPI);
  const isScenarioVsScenario = scenarioId && compareScenarioId;

  const params: Partial<ImpactComparisonParams> = {
    ...omit(filters, 'indicatorId'),
    indicatorIds: [indicator.id],
  };

  // Scenario vs scenario comparison
  if (scenarioId && compareScenarioId) {
    params.baseScenarioId = scenarioId as string;
    params.comparedScenarioId = compareScenarioId as string;
  } else {
    params.comparedScenarioId = compareScenarioId as string;
  }

  const enabled =
    !!filters?.indicatorId &&
    !!filters.startYear &&
    !!filters.endYear &&
    filters.endYear !== filters.startYear;

  const { data, isFetched, isFetching } = useImpactComparison(params, { enabled });

  const chartData = useMemo<ChartData>(() => {
    const { indicatorShortName, yearSum, metadata } = data?.data?.impactTable?.[0] || {};
    const nonProjectedData = (yearSum?.filter(({ isProjected }) => !isProjected) || []).sort(
      ({ year }) => year,
    );
    const lastYearNonProjectedData = nonProjectedData[nonProjectedData.length - 1];
    // Add the last year of non projected data to the projected data
    const values =
      yearSum?.map((item) => ({
        ...item,

        // Actual data
        value: !item.isProjected ? item.value : null,
        valueProjected:
          lastYearNonProjectedData.year === item.year || item.isProjected ? item.value : null,

        // Scenario 1
        scenarioOneValue: !item.isProjected
          ? item.baseScenarioValue || item.comparedScenarioValue
          : null,
        scenarioOneValueProjected:
          lastYearNonProjectedData.year === item.year || item.isProjected
            ? item.baseScenarioValue || item.comparedScenarioValue
            : null,

        // Scenario 2
        scenarioTwoValue: !item.isProjected ? item.comparedScenarioValue : null,
        scenarioTwoValueProjected:
          lastYearNonProjectedData.year === item.year || item.isProjected
            ? item.comparedScenarioValue
            : null,
      })) || [];

    setItemOpacity({
      value: defaultOpacity,
      scenarioOneValue: defaultOpacity,
      scenarioTwoValue: defaultOpacity,
    });

    return {
      values,
      name: indicatorShortName,
      unit: metadata?.unit,
    };
  }, [data]);

  /**
   * Toggle legend opacity
   */
  const handleLegendClick = useCallback(
    (obj) => {
      const { dataKey } = obj;
      const newOpacities = {
        ...itemOpacity,
        [dataKey]: defaultOpacity,
      };
      Object.keys(newOpacities).forEach((key) => {
        if (key !== dataKey && itemOpacity[dataKey] === alternativeOpacity) {
          newOpacities[key] = alternativeOpacity;
        } else if (key !== dataKey) {
          newOpacities[key] =
            newOpacities[key] === defaultOpacity ? alternativeOpacity : defaultOpacity;
        }
      });
      setItemOpacity(newOpacities);
    },
    [itemOpacity],
  );

  const renderLegend = useCallback(
    (props) => <CustomLegend {...props} onClick={handleLegendClick} />,
    [handleLegendClick],
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
                  {!isScenarioVsScenario && (
                    <>
                      <Line
                        animationEasing="ease"
                        animationDuration={500}
                        dataKey="value"
                        stroke="#AEB1B5"
                        strokeOpacity={itemOpacity.value || defaultOpacity}
                        strokeWidth={2}
                        type="linear"
                      />
                      <Line
                        animationEasing="ease"
                        animationDuration={500}
                        dataKey="valueProjected"
                        dot={{ strokeDasharray: 0, strokeWidth: 2 }}
                        stroke="#AEB1B5"
                        strokeDasharray="4 3"
                        strokeOpacity={itemOpacity.value || defaultOpacity}
                        strokeWidth={2}
                        type="linear"
                        legendType="none"
                      />
                    </>
                  )}

                  {/* Scenario 1 */}
                  <Line
                    animationEasing="ease"
                    animationDuration={500}
                    dataKey="scenarioOneValue"
                    stroke="#3F59E0"
                    strokeOpacity={itemOpacity.scenarioOneValue || defaultOpacity}
                    strokeWidth={2}
                    type="linear"
                  />
                  <Line
                    animationEasing="ease"
                    animationDuration={500}
                    dataKey="scenarioOneValueProjected"
                    dot={{ strokeDasharray: 0, strokeWidth: 2 }}
                    stroke="#3F59E0"
                    strokeDasharray="4 3"
                    strokeOpacity={itemOpacity.scenarioOneValue || defaultOpacity}
                    strokeWidth={2}
                    type="linear"
                    legendType="none"
                  />

                  {/* Scenario 2 */}
                  {isScenarioVsScenario && (
                    <>
                      <Line
                        animationEasing="ease"
                        animationDuration={500}
                        dataKey="scenarioTwoValue"
                        stroke="#4AB7F3"
                        strokeOpacity={itemOpacity.scenarioTwoValue || defaultOpacity}
                        strokeWidth={2}
                        type="linear"
                      />
                      <Line
                        animationEasing="ease"
                        animationDuration={500}
                        dataKey="scenarioTwoValueProjected"
                        dot={{ strokeDasharray: 0, strokeWidth: 2 }}
                        stroke="#4AB7F3"
                        strokeDasharray="4 3"
                        strokeOpacity={itemOpacity.scenarioTwoValue || defaultOpacity}
                        strokeWidth={2}
                        type="linear"
                        legendType="none"
                      />
                    </>
                  )}
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
