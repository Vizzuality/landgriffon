import { DownloadIcon } from '@heroicons/react/outline';
import { InformationCircleIcon } from '@heroicons/react/solid';

import Button from 'components/button';

import Table from 'containers/analysis-visualization/analysis-table/table';
import TableTitle from 'containers/analysis-visualization/analysis-table/table-title';

import DATA from './mock';

export type AnalysisTableProps = {};

const AnalysisTable: React.FC<AnalysisTableProps> = () => {
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
      title: () => <TableTitle title="2021" />,
      dataIndex: '2021',
      key: '2021',
      width: 100,
      fixed: 'left',
    },
    {
      title: () => <TableTitle title="2022" />,
      dataIndex: '2022',
      key: '2022',
      width: 100,
    },
    {
      title: () => <TableTitle title="2023" />,
      dataIndex: '2023',
      key: '2023',
      width: 100,
    },
    {
      title: () => <TableTitle title="2024" />,
      dataIndex: '2024',
      key: '2024',
      width: 100,
    },
    {
      title: () => <TableTitle title="2025" />,
      dataIndex: '2025',
      key: '2025',
      width: 100,
    },
  ];
  return (
    <>
      <div className="flex justify-between my-6">
        <div className="flex items-center">
          <InformationCircleIcon className="w-5 h-4 mr-2 text-black" />
          <p className="m-0">
            Viewing absolute values for <b>Actual Data</b>
          </p>
        </div>
        <Button
          theme="secondary"
          size="base"
          className="flex-shrink-0"
          onClick={() => console.log('onDownload')}
        >
          <DownloadIcon className="w-5 h-4 mr-2 text-black" />
          Download
        </Button>
      </div>
      <Table columns={TABLE_COLUMNS} dataSource={DATA} />
    </>
  );
};

export default AnalysisTable;
