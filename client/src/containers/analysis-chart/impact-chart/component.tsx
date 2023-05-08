import { useCallback, useMemo, useState } from 'react';
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
import { NUMBER_FORMAT } from 'utils/number-format';

import type { ExtendedLegendProps } from './legend/component';
import type { Indicator } from 'types';

type StackedAreaChartProps = {
  indicator: Indicator;
};

const COLOR_SCALE = chroma.scale(['#2E34B0', '#5462D8', '#828EF5', '#B9C0FF', '#E3EEFF']);

const defaultOpacity = 0.9;
const alternativeOpacity = 0.1;

const StackedAreaChart: React.FC<StackedAreaChartProps> = ({ indicator }) => {
  const [itemOpacity, setItemOpacity] = useState<Record<string, number>>({});
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

    const colorScale = COLOR_SCALE.colors(keys.length);

    // Setting default item opacity
    setItemOpacity(opacities);

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

  const renderLegend = useCallback((props: ExtendedLegendProps) => <CustomLegend {...props} />, []);

  const renderTooltip = useCallback((props) => {
    if (props && props.active && props.payload && props.payload.length) {
      return <CustomTooltip {...props} />;
    }
  }, []);

  return (
    <div className="p-6 bg-white rounded-md shadow-sm" data-testid="analysis-chart">
      {isFetching && <Loading className="w-5 h-5 m-auto text-navy-400" />}
      {!data && !isFetching && (
        <div className="flex flex-col items-center justify-center h-[370px]">No data</div>
      )}
      {!isFetching && isFetched && data && (
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
                  <Legend
                    verticalAlign="top"
                    content={renderLegend}
                    height={90}
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
                      fillOpacity={itemOpacity[key] || defaultOpacity}
                      animationEasing="ease"
                      animationDuration={500}
                      opacity={itemOpacity[key] || defaultOpacity}
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
                      fillOpacity={itemOpacity[key] || defaultOpacity}
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
