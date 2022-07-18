import { useCallback, useMemo, useState } from 'react';
import { uniq } from 'lodash';
import { PagingPosition, SortingMode } from 'ka-table/enums';
import { DownloadIcon } from '@heroicons/react/outline';

import { useImpactData } from 'hooks/impact';

import AnalysisDynamicMetadata from 'containers/analysis-visualization/analysis-dynamic-metadata';
import Table, { DataType } from 'components/table';
import SummaryRow from 'components/table/summary-row';
import Loading from 'components/loading';
import LinkButton from 'components/button';

import { BIG_NUMBER_FORMAT } from 'utils/number-format';

import type { ITableData } from './types';
import { ITableProps } from 'ka-table';
import { CellProps } from 'components/table/cell';
import { ChildComponents } from 'ka-table/models';
import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis/scenarios';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { isComparisonEnabled } = useAppSelector(scenarios);
  const {
    data: {
      data: { impactTable },
      metadata,
    },
    isLoading,
    isFetching,
  } = useImpactData({ 'page[number]': currentPage, 'page[size]': pageSize });

  const totalIndicators = useMemo(() => {
    return !isLoading && impactTable.length === 1 ? impactTable[0].rows.length : impactTable.length;
  }, [isLoading, impactTable]);
  const [totalRows, setTotalRows] = useState(totalIndicators);

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
    // TO-DO: make it recursive to more levels, right now the max depth is 4
    impactTable.forEach((indicator) => {
      const rowParentId = isMultipleIndicator ? indicator.indicatorId : null;
      if (isMultipleIndicator) {
        // Indicators (top tree level)
        result.push({
          id: indicator.indicatorId,
          parentId: null,
          name: indicator.indicatorShortName,
          indicatorRows: indicator.rows.length,
          indicatorChildrenRows: indicator.rows.map((r) => ({
            id: `${rowParentId}`,
            name: r.name,
            childrenRows: r.children.length,
          })),
          datesRangeChart: datesRangeChartConfig(indicator.yearSum),
          ...indicator.yearSum
            .map(({ year, value }) => ({
              [year]: isComparisonEnabled ? { value, diff: 'TODO' } : value,
            }))
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
          indicatorRows: indicator.rows.length,
          indicatorChildrenRows: indicator.rows.map((r) => ({
            id: `${rowParentId}-${parentIndex}`,
            name: r.name,
            childrenRows: r.children.length,
          })),
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
  }, [impactTable, isComparisonEnabled]);

  // Years from impact table
  const years = useMemo(() => {
    const result = [];
    impactTable.forEach(({ yearSum }) => {
      const years = (yearSum || []).map(({ year }) => year);
      years.forEach((year) => result.push(year));
    });
    return uniq(result);
  }, [impactTable]);

  const projectedYears = useMemo<number[]>(
    () =>
      Object.values(impactTable)[0]
        ?.rows[0].values.filter(({ isProjected }) => !!isProjected)
        .map(({ year }) => year) as number[],
    [impactTable],
  );

  const firstProjectedYear = useMemo(
    () => projectedYears && Math.min(...projectedYears),
    [projectedYears],
  );

  // Totals for summary
  const yearsSum = useMemo(() => {
    const resultByYear = [];

    years.forEach((year) => {
      const result = impactTable.map((props) => {
        const yearSum = props.yearSum;
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
      total: totalIndicators,
      columns: [
        { key: 'name', title: 'Name', dataType: DataType.String },
        {
          key: 'datesRangeChart',
          title: `${minYear} - ${maxYear}`,
          dataType: DataType.LineChart,
          width: 140,
        },
        ...years.map((year) => ({
          key: year.toString(),
          title: year.toString(),
          dataType: isComparisonEnabled ? DataType.Object : DataType.Number,
          isFirstYearProjected: firstProjectedYear === year,
          isProjected: projectedYears.includes(year),
          width: 110,
        })),
      ],
      data: tableData,
      format: ({ value, column }) => {
        if (column.key !== 'datesRangeChart' && column.key !== 'name' && value.value) {
          return BIG_NUMBER_FORMAT(value.value);
        }
        if (column.key !== 'datesRangeChart' && column.key !== 'name' && Number.isNaN(+value)) {
          return '-';
        }
        return value;
      },
      childComponents: {
        summaryRow: {
          content: (props) => (
            <SummaryRow
              firstProjectedYear={firstProjectedYear}
              rowData={{ name: 'Total impact', ...yearsSum }}
              {...props}
            />
          ),
        },
        cell: {
          content: (props: CellProps) => {
            const { column, value } = props;
            switch (column.dataType) {
              case DataType.LineChart:
                return null;
              case DataType.Number:
                return BIG_NUMBER_FORMAT(value);
              case DataType.Object:
                // TODO: add comparison data here
                return <div>the object</div>;
              default:
                return value;
            }
          },
          elementAttributes: () => ({
            className: 'p-0',
          }),
        } as ChildComponents['cell'],
      },
    };
  }, [
    years,
    totalIndicators,
    tableData,
    isComparisonEnabled,
    firstProjectedYear,
    projectedYears,
    yearsSum,
  ]);

  const handleIndicatorRows = useCallback((total) => {
    setTotalRows(total);
  }, []);
  const csv = useMemo<string | null>(() => encodeURI(dataToCsv(tableProps)), [tableProps]);

  return (
    <>
      <div className="flex justify-between">
        <div className="flex items-end justify-between w-full">
          <AnalysisDynamicMetadata />
          <div>
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
            <div className="mt-3 font-sans text-xs font-bold leading-4 text-center text-gray-500 uppercase">
              Total {totalRows} {totalRows === 1 ? 'row' : 'rows'}
            </div>
          </div>
        </div>
      </div>
      <div className="relative">
        {isLoading && <Loading className="mr-3 -ml-1 text-green-700" />}

        <Table
          paging={{
            enabled: true,
            pageIndex: metadata.page - 1,
            pagesCount: metadata.totalPages,
            pageSize: metadata.size,
            totalItems: metadata.totalItems,
            pageSizes: [10, 20, 30, 40],
            position: PagingPosition.Bottom,
          }}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => setPageSize(size)}
          isLoading={isFetching}
          {...(tableProps as ITableProps)}
          handleIndicatorRows={handleIndicatorRows}
        />
      </div>
    </>
  );
};

export default AnalysisTable;
