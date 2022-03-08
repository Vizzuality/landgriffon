import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';
import classNames from 'classnames';

import LayerControl from './layer-control';
import ModeControl from './mode-control';
import AnalysisChart from './analysis-chart';
import AnalysisMap from './analysis-map';
import AnalysisFilters from './analysis-filters';
import AnalysisTable from './analysis-table';

const AnalysisVisualization: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysis);

  return (
    <>
      <div
        className={classNames(
          {
            'absolute top-6 left-6 xl:left-12 right-6 z-20': visualizationMode === 'map',
            'py-6 pr-6 pl-6 xl:pl-12': visualizationMode !== 'map',
          },
          'flex gap-2 flex-wrap justify-between',
        )}
      >
        <div className="flex gap-2 flex-wrap">
          <LayerControl />
          <AnalysisFilters />
        </div>
        <div>
          <ModeControl />
        </div>
      </div>

      {visualizationMode === 'map' && <AnalysisMap />}

      {visualizationMode === 'table' && (
        <div className="flex flex-col pr-6 pl-6 xl:pl-12">
          <AnalysisTable />
        </div>
      )}

      {visualizationMode === 'chart' && (
        <div className="flex flex-col pr-6 pl-12">
          <AnalysisChart />
        </div>
      )}
    </>
  );
};

export default AnalysisVisualization;
