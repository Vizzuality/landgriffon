import { useMemo, PropsWithChildren } from 'react';
import { DataType } from 'ka-table/enums';

import Table from 'components/table';
import LineChart from 'components/chart/line';
import { ISummaryCellProps, ICellProps } from 'ka-table/props';
import { DATA_NUMBER_FORMAT } from '../../constants';

import type { ImpactTableData } from 'types';
import { GroupRowData } from 'ka-table/models';

type CustomSummaryCell = ISummaryCellProps & {
  yearSum: {
    year: number;
    value: number;
  }[];
  rowData: unknown;
  columns: ColumnHeadings[];
  width: number;
};

type ColumnHeadings = Readonly<{
  dataType: DataType.String | DataType.Number;
  key: string;
  title: string;
  width?: number;
  chart?: boolean;
}>;

type Prueba = ICellProps & {
  column: { chart: boolean; width: number };
  rowData: GroupRowData;
};

const AnalysisTable: React.FC<{ data: ImpactTableData }> = ({ data }) => {
  // initial value of the *props

  const { indicatorId, yearSum, rows } = data;

  const years = useMemo<number[]>(() => yearSum.map(({ year }) => year), [yearSum]);

  const columnValues = useMemo(
    () =>
      yearSum.map(({ year }) => ({
        key: year.toString(),
        title: year.toString(),
        dataType: DataType.Number,
        width: 100,
      })),
    [yearSum],
  );

  const dataValues = useMemo(
    () =>
      rows.map((row, rowIndex) => ({
        id: `${indicatorId}-${rowIndex}`,
        name: row.name,
        ...row.values
          .map(({ year, value }) => ({ [year as number]: DATA_NUMBER_FORMAT(value as number) }))
          .reduce((a, b) => ({ ...a, ...b })),
      })),
    [rows, indicatorId],
  );
  const tableProps = useMemo(() => {
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return {
      key: indicatorId,
      rowKeyField: 'id',
      columns: [
        { key: 'name', title: 'Name', dataType: DataType.String, width: 250 },
        {
          key: 'dates-range',
          title: `${minYear}-${maxYear}`,
          chart: true,
          width: 100,
        },
        ...columnValues,
      ],
      data: dataValues,
      yearSum,
    };
  }, [yearSum, years, indicatorId, columnValues, dataValues]);

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
            className: 'font-bold uppercase text-xs leading-4 text-gray-500 whitespace-nowrap',
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
                className: 'h-auto py-3 sticky left-0 group-even:bg-gray-50 group-odd:bg-red',
              };
            }
            return {
              className: 'h-auto py-3',
            };
          },
          content: (props: PropsWithChildren<Prueba>) => {
            if (props.column.chart) {
              const chartData = Object.entries(props.rowData).map((row) => ({
                x: row[0] as string | number,
                y: row[1] as string | number,
              }));

              const filtered: { x: number | string; y: number | string }[] = chartData.filter(
                (d) => d.x !== 'id' && d.x !== 'name',
              );

              const xAxisValues = filtered.map((d) => Number(d.x));
              const xMaxValue = Math.max(...xAxisValues);
              const xMinValue = Math.min(...xAxisValues);

              const min = xMaxValue - xMinValue;
              const chartConfig = {
                lines: [
                  {
                    stroke: '#909194',
                    width: '100%',
                    dataKey: 'primary_line',
                    data: filtered.filter((d) => Number(d.x) > xMinValue + min / 2),
                  },
                  {
                    stroke: '#909194',
                    width: '100%',
                    strokeDasharray: '3 3',
                    dataKey: 'secondary_line',
                    data: filtered,
                  },
                ],
              };

              return (
                <div className="ka-cell-text text-center font-bold uppercase text-xs flex justify-center">
                  <LineChart chartConfig={chartConfig} width={props.column.width} />
                </div>
              );
            }
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
