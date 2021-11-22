import cx from 'classnames';

import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import { useAnalysisChart, useAnalysisLegend } from 'hooks/analysis';

import { motion, AnimatePresence } from 'framer-motion';

import Loading from 'components/loading';
import Chart from 'components/chart';
import AreaStacked from 'components/chart/area-stacked';
import Widget from 'components/widget';

const AnalysisChart: React.FC = () => {
  const { filters } = useAppSelector(analysis);

  const { data: chartData, isFetching: chartIsFetching } = useAnalysisChart();
  const { data: legendData, isFetching: legendIsFetching } = useAnalysisLegend();

  const isFetching = chartIsFetching || legendIsFetching;

  return (
    <>
      {isFetching && <Loading className="text-white" />}

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
                >
                  <Widget title={indicator} height={chartData.length > 1 ? 325 : 500}>
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
                </motion.div>
              );
            })}
          </div>

          <motion.ul
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
          </motion.ul>
        </AnimatePresence>
      )}
    </>
  );
};

export default AnalysisChart;
