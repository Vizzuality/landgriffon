import { useMemo } from 'react';
import { ITableProps } from 'ka-table';
import { DataType } from 'ka-table/enums';

import Table from 'components/table';
import { ISummaryCellProps } from 'ka-table/props';
import { DATA_NUMBER_FORMAT } from '../../constants';

import type { ImpactTableData } from 'types';

type ITableData = ITableProps & {
  yearSum: Record<string, string>;
};

type CustomSummaryCell = ISummaryCellProps & {
  yearSum: Record<string, string>;
};

const SingleIndicatorTable: React.FC<{ data: ImpactTableData }> = ({ data }) => {
  // Parse data for table
  const tableData = useMemo(() => {
    const { indicatorId, rows } = data;
    const result = [];

    rows.forEach(({ name, values }) => {
      result.push({
        id: `${indicatorId}-${name}`,
        name,
        ...values
          .map(({ year, value }) => ({ [year as string]: DATA_NUMBER_FORMAT(value as number) }))
          .reduce((a, b) => ({ ...a, ...b })),
      });
    });

    return result;
  }, [data]);

  // Totals for summary
  const yearSum = useMemo(() => {
    const { yearSum } = data;
    return yearSum
      .map(({ year, value }) => ({ [year]: DATA_NUMBER_FORMAT(value as number) }))
      .reduce((a, b) => ({ ...a, ...b }));
  }, [data]);

  // Years from table data
  const years = useMemo(() => {
    const { yearSum } = data;
    return yearSum.map(({ year }) => year);
  }, [data]);

  // initial value of the *props
  const tableProps: ITableData = useMemo(() => {
    return {
      rowKeyField: 'id',
      columns: [
        { key: 'name', title: 'Name', dataType: DataType.String, width: 250 },
        ...years.map((year) => ({
          key: year.toString(),
          title: year.toString(),
          DataType: DataType.Number,
          width: 100,
        })),
      ],
      data: tableData,
      yearSum,
    };
  }, [tableData, yearSum, years]);

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
            const totalCell = props.yearSum[props.column.key];
            return (
              <div className="ka-cell-text text-center font-bold uppercase text-gray-500 text-xs">
                {totalCell}
              </div>
            );
          },
        },
      }}
    />
  );
};

export default SingleIndicatorTable;
