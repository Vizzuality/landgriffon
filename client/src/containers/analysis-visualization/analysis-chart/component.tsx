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

  const { data: allChartData, legend: allLegendData, isFetching } = useAnalysisChart();

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
              const { id, indicator, keys, values, colors } = d;

              return (
                <motion.div
                  key={`${id}-${JSON.stringify(filters)}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded shadow-sm p-5"
                >
                  <Widget
                    title={indicator}
                    height={chartData.length > 1 ? 325 : 500}
                    className="bg-none rounded-none shadow-none"
                  >
                    <Chart>
                      <AreaStacked
                        title={indicator}
                        data={values}
                        margin={{ top: 12, right: 12, bottom: 30, left: 30 }}
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
                  <ul className="flex flex-row flex-wrap gap-x-3">
                    {keys.map((key) => (
                      <li key={key} className="flex items-center space-x-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: d.colors[key] }}
                        />
                        <div>{key}</div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* <motion.ul
            key={`analysis-legend-${JSON.stringify(filters)}`}
            className="flex mt-4 space-x-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {legendData.map((l) => (
              <li
                key={`${l.id}-${JSON.stringify(filters)}`}
                className="flex items-center space-x-1"
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                <div>{l.name}</div>
              </li>
            ))}
          </motion.ul> */}
        </AnimatePresence>
      )}
    </>
  );
};

export default AnalysisChart;
