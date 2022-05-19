import cx from 'classnames';

import { useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';

import { useAnalysisChart } from 'hooks/analysis';

import { motion, AnimatePresence } from 'framer-motion';

import Loading from 'components/loading';
import Chart from 'components/chart';
import AreaStacked from 'components/chart/area-stacked';
import Widget from 'components/widget';
import { useMemo } from 'react';
import { RANKING_LIMIT } from './constants';

const AnalysisChart: React.FC = () => {
  const filters = useAppSelector(analysisFilters);

  const { data: allChartData, isFetching } = useAnalysisChart();

  const chartData = useMemo(() => {
    const trimmed = allChartData.map((chart) => {
      // Sort the first avaliable entry by value and get the keys of the top RANKING_LIMIT items
      const firstDateValues = chart.values[0];

      const topValueKeys = Object.entries(firstDateValues)
        .filter(([key]) => !['id', 'date', 'current'].includes(key))
        .sort(([, valueA], [, valueB]) => (valueB as number) - (valueA as number))
        .slice(0, RANKING_LIMIT)
        .map(([key]) => key);

      return {
        ...chart,
        keys: chart.keys.filter((key) => topValueKeys.includes(key)),
      };
    });

    return trimmed;
  }, [allChartData]);

  return (
    <>
      {isFetching && <Loading className="text-white -ml-1 mr-3" />}

      {!isFetching && chartData && (
        <AnimatePresence>
          <div
            key="analysis-chart"
            className={cx({
              'grid grid-cols-1 gap-5': true,
              'md:grid-cols-2': chartData.length > 1,
            })}
          >
            {chartData.map((d) => {
              const { id, indicator, keys, values, colors, unit } = d;

              return (
                <motion.div
                  key={`${id}-${JSON.stringify(filters)}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Widget title={indicator} unit={unit} height={chartData.length > 1 ? 325 : 500}>
                    <Chart>
                      <AreaStacked
                        title={indicator}
                        yAxisLabel={unit}
                        data={values}
                        margin={{ top: 12, right: 8, bottom: 30, left: 50 }}
                        keys={keys}
                        colors={colors}
                        // target={120}
                        settings={{
                          tooltip: true,
                          projection: true,
                          target: true,
                        }}
                      />
                    </Chart>
                  </Widget>
                  {/* Widget Legend */}
                  <ul className="flex flex-row flex-wrap gap-x-3 gap-y-1 mt-2">
                    {keys.map((key) => (
                      <li key={key} className="flex items-center gap-x-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: d.colors[key] }}
                        />
                        <span
                          title={key}
                          className="text-xs text-gray-500 max-w-[74px] truncate text-ellipsis"
                        >
                          {key}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </>
  );
};

export default AnalysisChart;
