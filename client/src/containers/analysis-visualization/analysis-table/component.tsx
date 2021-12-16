import { DownloadIcon } from '@heroicons/react/outline';
import { InformationCircleIcon } from '@heroicons/react/solid';

import { useIndicators } from 'hooks/indicators';
import { useImpactData } from 'hooks/impact';
import { useAnalysisData, useIndicatorAnalysisTable } from 'hooks/analysis';
import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import Button from 'components/button';
import Loading from 'components/loading';

import Table from 'containers/analysis-visualization/analysis-table/table';
import TableTitle from 'containers/analysis-visualization/analysis-table/table-title';

const AnalysisTable: React.FC = () => {
  const { filters } = useAppSelector(analysis);

  const { data: tableData, isFetched: tableDataIsFetched } = useImpactData();
  console.log('data', tableData);

  const { data: indicatorTableData, isFetched: indicatorTableDataIsFetched } =
    useIndicatorAnalysisTable();

  const getValueByYear = (columnYear, record) => {
    if (record && record.values) {
      const dataIndex = record.values.find((el) => el.year === columnYear)?.value;
      return dataIndex;
    }
    return null;
  };

  const FILTERED_DATA = filters.indicator?.value === 'all' ? tableData : indicatorTableData;

  const filteredDataIsFetched = tableDataIsFetched || indicatorTableDataIsFetched;

  const tableInitialColumns = [
    {
      title: 'YEAR',
      dataIndex: 'indicator',
      key: 'indicator',
      width: 150,
      fixed: 'left',
    },
    {
      title: `${filters.startYear}-${filters.endYear}`,
      dataIndex: 'all',
      key: 'all',
      width: 100,
      fixed: 'left',
    },
  ];

  const rangeOfYears = (start, end) =>
    Array(end - start + 1)
      .fill(start)
      .map((year, index) => year + index);

  // Substitute parameters by (filters.startYear, filters.endYear);
  const filteredYears = rangeOfYears(2020, 2024);

  const tableYearColumns = filteredYears.map((y, i) => {
    const isPastOrCurrentYear = y <= new Date().getFullYear();
    return {
      title: () => <TableTitle title={y} />,
      render: (record) => getValueByYear(y, record),
      key: 'values',
      width: 100,
      sorter: (a, b) => a.values[i].value - b.values[i].value,
      ...(isPastOrCurrentYear && { fixed: 'left' }),
    };
  });

  const TABLE_COLUMNS = (tableInitialColumns as []).concat(tableYearColumns as []);

  const onChange = (pagination: any, sorter: any, extra: any) => {
    console.info('params', pagination, sorter, extra);
  };

  return (
    <>
      <div className="flex justify-between mb-6">
        <div className="flex items-center">
          <p className="m-0">
            <InformationCircleIcon className="inline w-5 h-4 mr-2 text-black" />
            Viewing absolute values for <b>Actual Data</b>
          </p>
        </div>
        <Button
          theme="secondary"
          size="base"
          className="flex-shrink-0"
          onClick={() => console.info('onDownload')}
        >
          <DownloadIcon className="w-5 h-4 mr-2 text-black" />
          Download
        </Button>
      </div>
      <div className="relative">
        <Loading className="text-white" />
        {/* {FILTERED_DATA && filteredDataIsFetched && (
          <Table columns={TABLE_COLUMNS} dataSource={FILTERED_DATA} onChange={onChange} />
        )} */}
      </div>
    </>
  );
};

export default AnalysisTable;
