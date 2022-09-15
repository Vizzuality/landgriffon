import { useMemo } from 'react';
import { useStore } from 'react-redux';
import omit from 'lodash/omit';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { setVisualizationMode } from 'store/features/analysis';
import { analysisFilters } from 'store/features/analysis/filters';
import { filtersForTabularAPI } from 'store/features/analysis/selector';
import { useImpactRanking } from 'hooks/impact';
import { useIndicators } from 'hooks/indicators';

import ApplicationLayout from 'layouts/application';
import AnalysisLayout from 'layouts/analysis';
import AnalysisChart from 'containers/analysis-visualization/analysis-chart';
import Chart from 'components/chart';
import AreaStacked from 'components/chart/area-stacked';
import Widget from 'components/widget';
import Legend from 'containers/analysis-visualization/analysis-chart/analysis-chart-legend';

import Loading from 'components/loading';

import type { Store } from 'store';
import type { Indicator } from 'types';

type ImpactChartProps = {
  indicator: Indicator;
};

const ImpactChart: React.FC<ImpactChartProps> = ({ indicator }) => {
  const store: Store = useStore();
  const filters = filtersForTabularAPI(store.getState());

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

  const { data, isLoading } = useImpactRanking(
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
    const { indicatorId, indicatorShortName, rows, yearSum, metadata } =
      data?.impactTable?.[0] || {};
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
    return {
      data: result,
      keys,
      name: indicatorShortName,
      id: `impact-chart-item-${indicatorId}`,
      unit: metadata?.unit,
    };
  }, [data]);

  const legendData = useMemo(() => {
    const { rows, metadata, others } = data?.impactTable?.[0] || {};
    const result = [];
    rows?.forEach((row) => {
      result.push({ name: row.name });
    });
    if (others?.numberOfAggregatedEntities > 0) {
      result.push({ name: `Others (${others.numberOfAggregatedEntities})` });
    }
    return {
      items: result,
      unit: metadata?.unit,
    };
  }, [data]);
  console.log('data: ', data);
  console.log('chart data: ', chartData);
  console.log('legend data: ', legendData);

  return (
    <div className="p-6 bg-white rounded-md shadow-sm">
      {isLoading && <Loading className="w-5 h-5 m-auto text-primary" />}
      {!isLoading && chartData && (
        <div>
          <h2 className="flex-shrink-0 text-base">
            {chartData.name} ({chartData.unit})
          </h2>
          <div className="relative flex-grow mt-3">
            <div className="flex justify-between">
              <ul className="grid grid-cols-3 gap-2">
                {legendData.items.map((item) => (
                  <li key={item.name} className="flex items-center space-x-1">
                    <div className="w-2 h-3 rounded shrink-0 grow-0 bg-primary"></div>
                    <div className="overflow-hidden text-2xs whitespace-nowrap text-ellipsis">
                      {item.name}
                    </div>
                  </li>
                ))}
              </ul>
              <div>
                <div></div>
                <div className="text-xs whitespace-nowrap">Projected data</div>
              </div>
            </div>

            <div className="h-[300px]">
              <Chart>
                <AreaStacked
                  id={chartData.id}
                  title={chartData.name}
                  yAxisLabel={chartData.unit}
                  data={chartData.data}
                  margin={{ top: 12, right: 8, bottom: 30, left: 60 }}
                  keys={chartData.keys}
                  // colors={colors}
                  // activeArea={activeArea}
                  // target={120}
                  // projection={projection}
                  settings={{
                    tooltip: true,
                    projection: true,
                    target: true,
                  }}
                />
              </Chart>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactChart;
