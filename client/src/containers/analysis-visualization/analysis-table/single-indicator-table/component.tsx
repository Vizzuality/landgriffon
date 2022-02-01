import { useMemo, PropsWithChildren } from 'react';
import { DataType } from 'ka-table/enums';

import Table from 'components/table';
import LineChart from 'components/chart/line';
import { DATA_NUMBER_FORMAT } from 'containers/analysis-visualization/constants';

// types
import type { ImpactTableData } from 'types';
import { CustomChartCell, CustomSummaryCellSingleIndicator } from '../types';

const AnalysisTable: React.FC<{ data: ImpactTableData }> = ({ data }) => {
  const { indicatorId, yearSum, rows } = data;

  const years = useMemo<number[]>(() => yearSum.map(({ year }) => year), [yearSum]);

  const columnValues = useMemo(
    () =>
      yearSum.map(({ year }) => ({
        key: year.toString(),
        title: year.toString(),
        dataType: DataType.Number,
        width: 100,
        height: 50,
      })),
    [yearSum],
  );

  const dataValues = useMemo(
    () =>
      rows.map((row, rowIndex) => ({
        id: `${indicatorId}-${rowIndex}`,
        name: row.name,
        ...row.values
          .map(({ year, value }) => ({ [year as number]: value as number }))
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
      format: ({ value, column }) => {
        if (column.key !== 'dates-range' && column.key !== 'name' && value) {
          return DATA_NUMBER_FORMAT(value);
        }
        return value;
      },
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
      key={`${years[0]}-${years[years.length - 1]}`}
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
          content: (props: PropsWithChildren<CustomChartCell>) => {
            if (props.column.chart) {
              const chartData = Object.entries(props.rowData).map((row: [string, number]) => ({
                x: row[0],
                y: row[1],
              }));
              const filtered = chartData.filter((d) => years.includes(new Date(d.x).getFullYear()));

              const xAxisValues = filtered.map((d) => new Date(d.x).getFullYear());
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
                <div
                  style={{ width: props.column.width, height: 50 }}
                  className="ka-cell-text text-center font-bold uppercase text-xs flex justify-center h-full"
                >
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
          content: (props: CustomSummaryCellSingleIndicator) => {
            if (props.column.key === 'name') {
              return (
                <div className="ka-cell-text font-bold uppercase bg-gray-50 text-gray-500 text-xs">
                  Total impact
                </div>
              );
            }
            const totalCell = props.yearSum.find((d) => d.year.toString() === props.column.key);
            if (props.column.key === 'dates-range') return null;
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
