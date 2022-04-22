import { useMemo } from 'react';
import { uniq } from 'lodash';
import { DataType, SortingMode } from 'ka-table/enums';
import { DownloadIcon } from '@heroicons/react/outline';
import { InformationCircleIcon } from '@heroicons/react/solid';

import { useImpactData } from 'hooks/impact';

import Table from 'containers/table';
import SummaryRow from 'containers/table/summary-row';
import Loading from 'components/loading';

import { BIG_NUMBER_FORMAT } from 'utils/number-format';

import { ITableData } from './types';
import LinkButton from 'components/button';

const dataToCsv: (tableData: ITableData) => string = (tableData) => {
  const LINE_SEPARATOR = '\r\n';

  if (!tableData) return null;
  let str = 'data:text/csv;charset=utf-8,';
  str +=
    tableData.columns
      .filter(({ dataType }) => ['number', 'string'].includes(dataType))
      .map((column) => column.title)
      .join(';') + LINE_SEPARATOR;

  tableData.data.forEach(
    ({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      id,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      parentId,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      datesRangeChart,
      name,
      ...yearValues
    }) => {
      const rowData: (string | number)[] = [name];
      Object.values(yearValues).forEach((value) => {
        rowData.push(value as number);
      });

      str += rowData.join(';') + LINE_SEPARATOR;
    },
  );

  return str;
};

const AnalysisTable: React.FC = () => {
  const { data: impactData, isLoading, isFetching } = useImpactData();
  const {
    data: { impactTable },
  } = impactData;

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

  // Data to pass to the table
  const tableData = useMemo(() => {
    const result = [];
    const isMultipleIndicator = impactTable.length > 1;

    // TO-DO: make it recursive to more levels, right now the max deep is 4
    impactTable.forEach((indicator) => {
      const rowParentId = isMultipleIndicator ? indicator.indicatorId : null;

      if (isMultipleIndicator) {
        // Indicators (top tree level)
        result.push({
          id: indicator.indicatorId,
          parentId: null,
          name: indicator.indicatorShortName,
          datesRangeChart: datesRangeChartConfig(indicator.yearSum),
          ...indicator.yearSum
            .map(({ year, value }) => ({ [year]: value }))
            .reduce((a, b) => ({ ...a, ...b })),
        });
      }

      // Indicator rows
      indicator.rows.forEach((row, parentIndex) => {
        const secondParentId = `${rowParentId}-${parentIndex}`;

        result.push({
          id: secondParentId,
          parentId: rowParentId,
          name: row.name,
          datesRangeChart: datesRangeChartConfig(row.values),
          ...row.values
            .map(({ year, value }) => ({ [year as string]: value }))
            .reduce((a, b) => ({ ...a, ...b })),
        });

        const child = row.children;

        if (child?.length > 0) {
          child.forEach((childRow, childIndex) => {
            const thirdParentId = `${secondParentId}-${childIndex}`;

            result.push({
              id: thirdParentId,
              parentId: secondParentId,
              name: childRow.name,
              datesRangeChart: datesRangeChartConfig(childRow.values),
              ...childRow.values
                .map(({ year, value }) => ({ [year as string]: value }))
                .reduce((a, b) => ({ ...a, ...b })),
            });

            const grandChild = childRow.children;

            if (grandChild?.length > 0) {
              grandChild.forEach((grandChildRow, childIndex) => {
                result.push({
                  id: `${thirdParentId}-${childIndex}`,
                  parentId: thirdParentId,
                  name: grandChildRow.name,
                  datesRangeChart: datesRangeChartConfig(grandChildRow.values),
                  ...grandChildRow.values
                    .map(({ year, value }) => ({ [year as string]: value }))
                    .reduce((a, b) => ({ ...a, ...b })),
                });
              });
            }
          });
        }
      });
    });

    return result;
  }, [impactTable]);

  // Years from impact table
  const years = useMemo(() => {
    const result = [];
    impactTable.forEach(({ yearSum }) => {
      const years = (yearSum || []).map(({ year }) => year);
      years.forEach((year) => result.push(year));
    });
    return uniq(result);
  }, [impactTable]);

  // Totals for summary
  const yearsSum = useMemo(() => {
    const resultByYear = [];

    years.forEach((year) => {
      const result = impactTable.map(({ yearSum }) => {
        const yearValue = yearSum.find((sum) => sum.year === year);
        if (yearValue) return yearValue;
        return { year, value: null };
      });

      resultByYear.push(result.reduce((a, b) => ({ year, value: a.value + b.value })));
    });

    if (!resultByYear.length) return [];
    return resultByYear
      .map(({ year, value }) => ({ [year as string]: value }))
      .reduce((a, b) => ({ ...a, ...b }));
  }, [impactTable, years]);

  // Table configuration
  const tableProps: ITableData = useMemo(() => {
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return {
      rowKeyField: 'id',
      treeGroupKeyField: 'parentId',
      treeGroupsExpanded: [],
      sortingMode: SortingMode.Single,
      columns: [
        { key: 'name', title: 'Name', dataType: DataType.String },
        {
          key: 'datesRangeChart',
          title: `${minYear} - ${maxYear}`,
          type: 'line-chart',
          width: 140,
        },
        ...years.map((year) => ({
          key: year.toString(),
          title: year.toString(),
          dataType: DataType.Number,
          width: 110,
        })),
      ],
      data: tableData,
      format: ({ value, column }) => {
        if (column.key !== 'datesRangeChart' && column.key !== 'name' && value) {
          return BIG_NUMBER_FORMAT(value);
        }
        if (column.key !== 'datesRangeChart' && column.key !== 'name' && Number.isNaN(+value)) {
          return '-';
        }
        return value;
      },
      childComponents: {
        summaryRow: {
          content: (props) => (
            <SummaryRow rowData={{ name: 'Total impact', ...yearsSum }} {...props} />
          ),
        },
      },
    };
  }, [tableData, years, yearsSum]);

  const csv = useMemo<string | null>(() => encodeURI(dataToCsv(tableProps)), [tableProps]);

  return (
    <>
      <div className="flex justify-between">
        <div className="flex items-center">
          <p className="m-0">
            <InformationCircleIcon className="inline w-5 h-4 mr-2 text-black" />
            Viewing absolute values for <b>Actual Data</b>
          </p>
        </div>
        <LinkButton
          href={csv}
          theme="secondary"
          size="base"
          className="flex-shrink-0"
          disabled={isLoading}
          download="report.csv"
        >
          <DownloadIcon className="w-5 h-4 mr-2 text-black" />
          Download
        </LinkButton>
      </div>
      <div className="relative mt-2">
        {isLoading && <Loading className="text-green-700 -ml-1 mr-3" />}

        <Table isLoading={isFetching} {...tableProps} />
      </div>
    </>
  );
};

export default AnalysisTable;
