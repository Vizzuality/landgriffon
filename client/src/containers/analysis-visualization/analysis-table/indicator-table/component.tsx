import { useMemo } from 'react';
import { ITableProps } from 'ka-table';
import { DataType } from 'ka-table/enums';

import Table from 'components/table';
import { ISummaryCellProps } from 'ka-table/props';
import { DATA_NUMBER_FORMAT } from '../../constants';

type ITableData = ITableProps & {
  key?: string;
  yearSum: {
    year: number;
    value: number;
  }[];
};

type CustomSummaryCell = ISummaryCellProps & {
  yearSum: {
    year: number;
    value: number;
  }[];
};

const AnalysisTable: React.FC<{ data: any }> = ({ data }) => {
  console.log(data);
  // initial value of the *props
  const tableProps: ITableData = useMemo(() => {
    const { indicatorId, yearSum, rows } = data;
    return {
      key: indicatorId,
      rowKeyField: 'id',
      columns: [
        { key: 'name', title: 'Name', dataType: DataType.String, width: 250 },
        ...yearSum.map(({ year }) => ({
          key: year.toString(),
          title: year.toString(),
          DataType: DataType.Number,
          width: 100,
        })),
      ],
      data: rows.map((row, rowIndex) => ({
        id: `${indicatorId}-${rowIndex}`,
        name: row.name,
        ...row.values
          .map(({ year, value }) => ({ [year as string]: DATA_NUMBER_FORMAT(value as number) }))
          .reduce((a, b) => ({ ...a, ...b })),
      })),
      yearSum,
    };
  }, [data]);

  return (
    <Table
      tablePropsInit={tableProps}
      childComponents={{
        tableWrapper: {
          elementAttributes: () => ({
            className: 'rounded-md border w-full',
          }),
        },
        tableHead: {
          elementAttributes: () => ({
            className: 'border-b border-gray-300',
          }),
        },
        tableFoot: {
          elementAttributes: () => ({
            className: 'border-t border-gray-300',
          }),
        },
        headCell: {
          elementAttributes: (props) => {
            if (props.column.key === 'name') {
              return {
                className: 'h-auto py-3 bg-gray-50 sticky left-0 z-10',
              };
            }
            return {
              className: 'h-auto py-3 bg-gray-50 text-center',
            };
          },
        },
        headCellContent: {
          elementAttributes: () => ({
            className: 'font-bold uppercase text-xs leading-4 text-gray-500',
          }),
        },
        dataRow: {
          elementAttributes: () => ({
            className: 'border-0 group even:bg-gray-50',
          }),
        },
        cell: {
          elementAttributes: (props) => {
            if (props.column.key === 'name') {
              return {
                className: 'h-auto py-3 sticky left-0 group-even:bg-gray-50 group-odd:bg-white',
              };
            }
            return {
              className: 'h-auto py-3',
            };
          },
        },
        cellText: {
          elementAttributes: (props) => {
            if (props.column.key === 'name') {
              return {
                className: 'text-gray-900 leading-5',
              };
            }
            return {
              className: 'text-gray-500 leading-5 text-center',
            };
          },
        },
        summaryCell: {
          elementAttributes: (props) => {
            if (props.column.key === 'name') {
              return {
                className: 'h-auto py-3 bg-gray-50 sticky left-0',
              };
            }
            return {
              className: 'h-auto py-3 bg-gray-50',
            };
          },
          content: (props: CustomSummaryCell) => {
            if (props.column.key === 'name') {
              return (
                <div className="ka-cell-text font-bold uppercase bg-gray-50 text-gray-500 text-xs">
                  Total impact
                </div>
              );
            }
            const totalCell = props.yearSum.find((d) => d.year.toString() === props.column.key);
            return (
              <div className="ka-cell-text text-center font-bold uppercase text-gray-500 text-xs">
                {totalCell && DATA_NUMBER_FORMAT(totalCell.value)}
              </div>
            );
          },
        },
      }}
    />
  );
};

export default AnalysisTable;
