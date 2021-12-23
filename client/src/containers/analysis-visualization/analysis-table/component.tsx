import { useMemo } from 'react';
import { DownloadIcon } from '@heroicons/react/outline';
import { InformationCircleIcon } from '@heroicons/react/solid';
import { DataType } from 'ka-table/enums';

import { useImpactData } from 'hooks/impact';

import Button from 'components/button';
import Loading from 'components/loading';
import Table from 'components/table';

const AnalysisTable: React.FC = () => {
  const { data: impactData, isLoading } = useImpactData();

  // initial value of the *props
  const tableData = useMemo(() => {
    const {
      data: { impactTable },
    } = impactData;

    return impactTable.map(({ indicatorId, yearSum, rows }) => ({
      key: indicatorId,
      rowKeyField: 'id',
      columns: [
        { key: 'material', title: 'Material', dataType: DataType.String },
        ...yearSum.map(({ year }) => ({
          key: year.toString(),
          title: year.toString(),
          DataType: DataType.Number,
        })),
      ],
      data: rows.map((row, rowIndex) => ({
        id: `${indicatorId}-${rowIndex}`,
        material: row.name,
        ...row.values
          .map(({ year, value }) => ({ [year as string]: value }))
          .reduce((a, b) => ({ ...a, ...b })),
      })),
    }));
  }, [impactData]);

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
        {isLoading && <Loading className="text-green-700" />}
        {impactData &&
          !isLoading &&
          tableData.map(({ key, ...tableProps }) => (
            <div key={key} className="my-4">
              <Table {...tableProps} />
            </div>
          ))}
      </div>
    </>
  );
};

export default AnalysisTable;
