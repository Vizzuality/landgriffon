import { useMemo } from 'react';
import { DownloadIcon } from '@heroicons/react/outline';
import { InformationCircleIcon } from '@heroicons/react/solid';
import { ITableProps } from 'ka-table';
import { DataType } from 'ka-table/enums';

import { useImpactData } from 'hooks/impact';

import Button from 'components/button';
import Loading from 'components/loading';
import Table from 'components/table';
import { ISummaryRowProps } from 'ka-table/props';

type ITableData = ITableProps & {
  key?: string;
  yearSum: {
    year: number;
    value: number;
  }[];
};

type CustomSummaryRow = ISummaryRowProps & {
  yearSum: {
    year: number;
    value: number;
  }[];
};

const AnalysisTable: React.FC = () => {
  const { data: impactData, isLoading } = useImpactData();

  // initial value of the *props
  const tableData: ITableData[] = useMemo(() => {
    const {
      data: { impactTable },
    } = impactData;

    return impactTable.map(
      ({ indicatorId, yearSum, rows }): ITableData => ({
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
        yearSum,
      }),
    );
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
              <Table
                tablePropsInit={tableProps}
                childComponents={{
                  summaryRow: {
                    content: (props: CustomSummaryRow) =>
                      props.columns.map((column) => {
                        if (column.key === 'material') {
                          return (
                            <td key={column.key} className="ka-cell">
                              <div className="ka-cell-text">Total</div>
                            </td>
                          );
                        }
                        return (
                          <td key={column.key} className="ka-cell">
                            <div className="ka-cell-text">
                              {props.yearSum.find((d) => d.year.toString() === column.key).value}
                            </div>
                          </td>
                        );
                      }),
                  },
                }}
              />
            </div>
          ))}
      </div>
    </>
  );
};

export default AnalysisTable;
