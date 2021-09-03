import cx from 'classnames';

import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import { useAnalysisChart } from 'lib/hooks/analysis';

import { motion, AnimatePresence } from 'framer-motion';

import Loading from 'components/loading';
import Chart from 'components/chart';
import AreaStacked from 'components/chart/area-stacked';
import Widget from 'components/widget';

export type AnalysisChartProps = {};

const AnalysisChart: React.FC<AnalysisChartProps> = () => {
  const { filters } = useAppSelector(analysis);
  const { data, isFetching } = useAnalysisChart({ filters });

  return (
    <div className="relative">
      <Loading
        visible={isFetching}
        className="absolute z-10 flex items-center justify-center w-full h-full bg-white bg-opacity-75"
        iconClassName="w-5 h-5 text-gray-500"
      />

      <AnimatePresence>
        <div
          className={cx({
            'grid grid-cols-1 gap-5': true,
            'md:grid-cols-2': data.length > 1,
          })}
        >
          {data.map((d) => {
            const { id, indicator, keys, values } = d;

            return (
              <motion.div
                key={`${id}-${data.length}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Widget title={indicator} height={data.length > 1 ? 250 : 500}>
                  <Chart>
                    <AreaStacked
                      data={values}
                      margin={{ top: 12, right: 12, bottom: 30, left: 30 }}
                      keys={keys}
                      target={120}
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
      </AnimatePresence>
    </div>
  );
};

export default AnalysisChart;
