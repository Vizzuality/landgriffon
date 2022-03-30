import { useMemo } from 'react';
import { DataType, SortingMode } from 'ka-table/enums';

import { DATA_NUMBER_FORMAT } from 'containers/analysis-visualization/constants';
import Table from 'containers/table';
import SummaryRow from 'containers/table/summary-row';

// types
import type { ImpactTableData } from 'types';

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

  const dataValues = useMemo(() => {
    const datesRangeChartConfig = (data) => {
      const chartData = data.map(({ year, value }) => ({
        x: year,
        y: value,
      }));

      const xAxisValues = chartData.map(({ x }) => x);
      const xMaxValue = Math.max(...xAxisValues);
      const xMinValue = Math.min(...xAxisValues);
      const min = xMaxValue - xMinValue;

      return {
        lines: [
          {
            stroke: '#909194',
            width: '100%',
            dataKey: 'primary_line',
            data: chartData.filter(({ x }) => x < xMinValue + min / 2),
          },
          {
            stroke: '#909194',
            width: '100%',
            strokeDasharray: '3 3',
            dataKey: 'secondary_line',
            data: chartData,
          },
        ],
      };
    };

    return rows.map((row, rowIndex) => ({
      id: `${indicatorId} - ${rowIndex}`,
      name: row.name,
      datesRangeChart: datesRangeChartConfig(row.values),
      ...row.values
        .map(({ year, value }) => ({ [year as number]: value as number }))
        .reduce((a, b) => ({ ...a, ...b })),
    }));
  }, [rows, indicatorId]);

  // Totals for summary
  const yearsSum = useMemo(() => {
    return yearSum
      .map(({ year, value }) => ({ [year]: DATA_NUMBER_FORMAT(value) }))
      .reduce((a, b) => ({ ...a, ...b }));
  }, [yearSum]);

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
          key: 'datesRangeChart',
          title: `${minYear} - ${maxYear}`,
          type: 'line-chart',
          width: 140,
        },
        ...columnValues,
      ],
      data: dataValues,
      childComponents: {
        summaryRow: {
          content: (props) => (
            <SummaryRow rowData={{ name: 'Total impact', ...yearsSum }} {...props} />
          ),
        },
      },
      sortingMode: SortingMode.Single,
      paging: {
        enabled: true,
        pageIndex: 0,
        pageSize: 25,
        pageSizes: [25, 50, 100],
      },
    };
  }, [yearsSum, years, indicatorId, columnValues, dataValues]);

  const tableKey: string = useMemo(() => `${years[0]}-${years[years.length - 1]}`, [years]);

  return <Table key={tableKey} {...tableProps} />;
};

export default AnalysisTable;
