import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import Table from './table';
import DATA from './table/mock';
import Title from './table/title';

import DatasetControl from './dataset-control';
import ModeControl from './mode-control';
import AnalysisChart from './analysis-chart';
import AnalysisMap from './analysis-map';
import AnalysisFilters from './analysis-filters';

const AnalysisVisualization: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysis);
  const TABLE_COLUMNS = [
    {
      title: 'YEAR',
      dataIndex: 'commodity',
      key: 'commodity',
      width: 150,
      fixed: 'left',
    },
    {
      title: '2021-2025',
      dataIndex: 'all',
      key: 'all',
      width: 100,
      fixed: 'left',
    },
    {
      title: () => <Title title="2021" />,
      dataIndex: '2021',
      key: '2021',
      width: 100,
      fixed: 'left',
    },
    {
      title: () => <Title title="2022" />,
      dataIndex: '2022',
      key: '2022',
      width: 100,
    },
    {
      title: () => <Title title="2023" />,
      dataIndex: '2023',
      key: '2023',
      width: 100,
    },
    {
      title: () => <Title title="2024" />,
      dataIndex: '2024',
      key: '2024',
      width: 100,
    },
    {
      title: () => <Title title="2025" />,
      dataIndex: '2025',
      key: '2025',
      width: 100,
    },
  ];

  return (
    <section className="relative flex flex-col flex-1 w-screen md:w-full sm:h-screen-minus-header md:h-full bg-gray-50 lg:order-last">
      <div
        className={`${
          visualizationMode === 'map' ? 'absolute' : 'relative'
        } top-6 z-10 flex gap-2 flex-wrap justify-between w-full px-12`}
      >
        <div className="flex gap-2 flex-wrap">
          <DatasetControl />
          <AnalysisFilters />
        </div>
        <div className="2xl:mr-20 z-10 inline-flex shadow-sm rounded-md">
          <ModeControl />
        </div>
      </div>

      {visualizationMode === 'map' && <AnalysisMap />}

      {visualizationMode === 'table' && (
        <div className="flex p-6 pl-12 mt-16 left-12">
          <Table columns={TABLE_COLUMNS} dataSource={DATA} />
        </div>
      )}

      {visualizationMode === 'chart' && (
        <div className="flex flex-col p-6 pl-12 mt-16 left-12 overflow-x-hidden">
          <div className="-my-2 sm:-mx-6">
            <div className="inline-block min-w-full py-2 align-middle">
              <AnalysisChart />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AnalysisVisualization;
