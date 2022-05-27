import { FC, useCallback, useState } from 'react';
import cx from 'classnames';

import { useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';

import { useAnalysisChart } from 'hooks/analysis';

import { motion, AnimatePresence } from 'framer-motion';

import Loading from 'components/loading';
import Chart from 'components/chart';
import AreaStacked from 'components/chart/area-stacked';
import Widget from 'components/widget';

const AnalysisChart: FC = () => {
  const filters = useAppSelector(analysisFilters);

  const [activeArea, setActiveArea] = useState(null);

  const { data: chartData, isFetching } = useAnalysisChart({
    maxRankingEntities: 5,
    sort: 'DES',
  });

  const handleActiveArea = useCallback(
    (key, indicator) => {
      if (!activeArea) {
        setActiveArea(`${key}-${indicator}`);
      } else setActiveArea(null);
    },
    [activeArea],
  );

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
              const { id, indicator, keys, values, colors, unit, projection } = d;

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
                  <ul className="flex flex-row flex-wrap gap-x-3 gap-y-1 mt-2">
                    {keys.map((key) => (
                      <li key={key} className="flex items-center gap-x-1">
                        <button
                          type="button"
                          className="flex items-center"
                          onClick={() => handleActiveArea(key, indicator)}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full mr-1"
                            style={{ backgroundColor: d.colors[key] }}
                          />
                          <span
                            title={key}
                            className={cx('text-xs', {
                              'truncate text-ellipsis text-gray-500 max-w-[74px]':
                                activeArea !== `${key}-${indicator}`,
                              'opacity-70 text-gray-900':
                                activeArea && activeArea !== `${key}-${indicator}`,
                            })}
                          >
                            {key}
                          </span>
                        </button>
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
