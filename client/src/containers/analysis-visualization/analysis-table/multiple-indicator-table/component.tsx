import { useMemo } from 'react';
import { DataType, SortingMode } from 'ka-table/enums';
import { uniq } from 'lodash';

import { DATA_NUMBER_FORMAT } from 'containers/analysis-visualization/constants';
import Table from 'containers/table';
import SummaryRow from 'containers/table/summary-row';

// types
import type { ImpactTableData } from 'types';
import { ITableData } from '../types';

const MultipleIndicatorTable: React.FC<{ data: ImpactTableData[] }> = ({ data }) => {
  // Data parsed for the table
  const tableData = useMemo(() => {
    const result = [];

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

    data.forEach(({ indicatorId, indicatorShortName, rows }) => {
      rows.forEach(({ name, values }) => {
        result.push({
          id: `${indicatorId}-${name}`,
          name,
          indicatorName: indicatorShortName,
          datesRangeChart: datesRangeChartConfig(values),
          ...values
            .map(({ year, value }) => ({ [year as string]: value }))
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
      .map(({ year, value }) => ({ [year as string]: DATA_NUMBER_FORMAT(value) }))
      .reduce((a, b) => ({ ...a, ...b }));
  }, [data, years]);

  const tableProps: ITableData = useMemo(() => {
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return {
      rowKeyField: 'id',
      columns: [
        { key: 'name', title: 'Name', dataType: DataType.String, width: 250 },
        {
          key: 'datesRangeChart',
          title: `${minYear} - ${maxYear}`,
          type: 'line-chart',
          width: 140,
        },
        { key: 'indicatorName', title: 'Indicator', dataType: DataType.String },
        ...years.map((year) => ({
          key: year.toString(),
          title: year.toString(),
          DataType: DataType.Number,
          width: 110,
        })),
      ],
      format: ({ value, column }) => {
        if (
          column.key !== 'datesRangeChart' &&
          column.key !== 'name' &&
          column.key !== 'indicatorName' &&
          value
        ) {
          return DATA_NUMBER_FORMAT(value);
        }
        return value;
      },
      data: tableData,
      groups: [{ columnKey: 'indicatorName' }],
      childComponents: {
        summaryRow: {
          content: (props) => (
            <SummaryRow rowData={{ name: 'Total impact', ...yearsSum }} {...props} />
          ),
        },
      },
      sortingMode: SortingMode.Single,
    };
  }, [years, tableData, yearsSum]);

  return <Table {...tableProps} />;
};

export default MultipleIndicatorTable;
