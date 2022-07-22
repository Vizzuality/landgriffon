import type { FC } from 'react';
import { useCallback, useState } from 'react';
import cx from 'classnames';

import { useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';

import { useAnalysisChart } from 'hooks/analysis';

import { motion, AnimatePresence } from 'framer-motion';

import Loading from 'components/loading';
import Chart from 'components/chart';
import AreaStacked from 'components/chart/area-stacked';
import Widget from 'components/widget';
import Legend from './analysis-chart-legend';

const AnalysisChart: FC = () => {
  const filters = useAppSelector(analysisFilters);

  const [activeArea, setActiveArea] = useState(null);

  const { data: chartData, isFetching } = useAnalysisChart({
    maxRankingEntities: 5,
    sort: 'DES',
  });

  const handleActiveArea = useCallback(
    (key, indicatorId) => {
      if (!activeArea) {
        setActiveArea(`${key}-${indicatorId}`);
      } else setActiveArea(null);
    },
    [activeArea],
  );

  return (
    <>
      {isFetching && <Loading className="text-green-700 w-12 h-12 m-auto" />}

      {!isFetching && chartData && (
        <AnimatePresence>
          <div
            key="analysis-chart"
            className={cx('grid grid-cols-1 gap-5', {
              'md:grid-cols-2': chartData.length > 1,
            })}
          >
            {chartData.map((d) => {
              const { id, indicator, keys, values, colors, unit, projection } = d;

              return (
                <motion.div
                  key={`${id}-${JSON.stringify(filters)}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded shadow-sm p-4"
                >
                  <Widget title={indicator} unit={unit} height={chartData.length > 1 ? 325 : 500}>
                    <Chart>
                      <AreaStacked
                        id={id}
                        title={indicator}
                        yAxisLabel={unit}
                        data={values}
                        margin={{ top: 12, right: 8, bottom: 30, left: 60 }}
                        keys={keys}
                        colors={colors}
                        activeArea={activeArea}
                        // target={120}
                        projection={projection}
                        settings={{
                          tooltip: true,
                          projection: true,
                          target: true,
                        }}
                      />
                    </Chart>
                  </Widget>
                  {/* Widget Legend */}
                  <Legend activeArea={activeArea} indicatorData={d} onClick={handleActiveArea} />
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
