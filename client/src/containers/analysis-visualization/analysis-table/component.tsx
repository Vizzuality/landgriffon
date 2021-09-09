import { DownloadIcon } from '@heroicons/react/outline';
import { InformationCircleIcon } from '@heroicons/react/solid';

import Button from 'components/button';

import Table from 'containers/analysis-visualization/analysis-table/table';
import TableTitle from 'containers/analysis-visualization/analysis-table/table-title';

import DATA from './mock';

export type AnalysisTableProps = {};

const AnalysisTable: React.FC<AnalysisTableProps> = () => {
  const getValueByYear = (columnYear, record) => {
    if (record.values) {
      const dataIndex = record.values.find((el) => el.year === columnYear).value;
      return dataIndex;
    }
    return null;
  };

  const TABLE_COLUMNS = [
    {
      title: 'YEAR',
      dataIndex: 'indicator',
      key: 'indicator',
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
      render: (record) => getValueByYear(2021, record),
      key: 'values',
      width: 100,
      fixed: 'left',
    },
    {
      title: () => <TableTitle title="2022" />,
      render: (record) => getValueByYear(2022, record),
      key: '2022',
      width: 100,
    },
    {
      title: () => <TableTitle title="2023" />,
      render: (record) => getValueByYear(2023, record),
      key: '2023',
      width: 100,
    },
    {
      title: () => <TableTitle title="2024" />,
      render: (record) => getValueByYear(2024, record),
      key: '2024',
      width: 100,
    },
    {
      title: () => <TableTitle title="2025" />,
      render: (record) => getValueByYear(2025, record),
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
