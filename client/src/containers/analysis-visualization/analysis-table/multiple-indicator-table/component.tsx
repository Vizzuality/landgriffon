import { useMemo } from 'react';
import { ITableProps } from 'ka-table';
import { DataType } from 'ka-table/enums';
import { uniq } from 'lodash';

import Table from 'components/table';
import { ISummaryCellProps } from 'ka-table/props';
import { DATA_NUMBER_FORMAT } from '../../constants';

import type { ImpactTableData } from 'types';

type ITableData = ITableProps & {
  key?: string;
  yearsSum: Record<number, string>;
};

type CustomSummaryCell = ISummaryCellProps & {
  yearsSum: Record<number, string>;
};

const MultipleIndicatorTable: React.FC<{ data: ImpactTableData[] }> = ({ data }) => {
  // Data parsed for the table
  const tableData = useMemo(() => {
    const result = [];

    data.forEach(({ indicatorId, indicatorShortName, rows }) => {
      rows.forEach(({ name, values }) => {
        result.push({
          id: `${indicatorId}-${name}`,
          name,
          indicatorName: indicatorShortName,
          ...values
            .map(({ year, value }) => ({ [year as string]: DATA_NUMBER_FORMAT(value as number) }))
            .reduce((a, b) => ({ ...a, ...b })),
        });
      });
    });

    return result;
  }, [data]);

  // Years from table data
  const years = useMemo(() => {
    const result = [];
    data.forEach(({ yearSum }) => {
      const years = yearSum.map(({ year }) => year);
      years.forEach((year) => result.push(year));
    });
    return uniq(result);
  }, [data]);

  // Totals for summary
  const yearsSum = useMemo(() => {
    const resultByYear = [];
    years.forEach((year) => {
      const result = data.map(({ yearSum }) => {
        const yearValue = yearSum.find((sum) => sum.year === year);
        if (yearValue) return yearValue;
        return { year, value: null };
      });
      resultByYear.push(result.reduce((a, b) => ({ year, value: a.value + b.value })));
    });
    return resultByYear
      .map(({ year, value }) => ({ [year as string]: DATA_NUMBER_FORMAT(value as number) }))
      .reduce((a, b) => ({ ...a, ...b }));
  }, [data, years]);

  const tableProps: ITableData = useMemo(() => {
    return {
      rowKeyField: 'id',
      columns: [
        { key: 'name', title: 'Name', dataType: DataType.String, width: 250 },
        { key: 'indicatorName', title: 'Indicator', dataType: DataType.String },
        ...years.map((year) => ({
          key: year.toString(),
          title: year.toString(),
          DataType: DataType.Number,
          width: 100,
        })),
      ],
      data: tableData,
      groups: [{ columnKey: 'indicatorName' }],
      yearsSum,
    };
  }, [tableData, yearsSum, years]);

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
            return (
              <div className="ka-cell-text text-center font-bold uppercase text-gray-500 text-xs">
                {props.yearsSum[props.column.key]}
              </div>
            );
          },
        },
      }}
    />
  );
};

export default MultipleIndicatorTable;
