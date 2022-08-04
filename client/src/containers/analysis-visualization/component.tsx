import { useAppSelector } from 'store/hooks';
import classNames from 'classnames';

import { analysisUI } from 'store/features/analysis/ui';

import ModeControl from './mode-control';
import AnalysisChart from './analysis-chart';
import AnalysisMap from './analysis-map';
import AnalysisFilters from './analysis-filters';
import AnalysisTable from './analysis-table';
import AnalysisDynamicMetadata from './analysis-dynamic-metadata';

const AnalysisVisualization: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysisUI);

  return (
    <>
      <div
        className={classNames(
          {
            'absolute top-6 left-6 xl:left-12 right-6 z-10': visualizationMode === 'map',
            'py-6 pr-6 pl-6 xl:pl-12': visualizationMode !== 'map',
          },
          'flex gap-2 flex-wrap justify-between',
        )}
      >
        <AnalysisFilters />
        <ModeControl />
      </div>

      {visualizationMode === 'map' && <AnalysisMap />}

      {visualizationMode === 'table' && (
        <div className="flex flex-col pl-6 pr-6 xl:pl-12">
          <AnalysisTable />
        </div>
      )}

      {visualizationMode === 'chart' && (
        <div className="flex flex-col h-full pl-12 pr-6">
          <AnalysisDynamicMetadata className="my-4" />
          <AnalysisChart />
        </div>
      )}
    </>
  );
};

export default AnalysisVisualization;
