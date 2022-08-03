import LinkButton from 'components/button';
import Loading from 'components/loading';
import AnalysisDynamicMetadata from 'containers/analysis-visualization/analysis-dynamic-metadata';
import { useImpactData } from 'hooks/impact';
import { uniq } from 'lodash';
import { useMemo, useState } from 'react';
import { scenarios } from 'store/features/analysis/scenarios';
import { useAppSelector } from 'store/hooks';

import { DownloadIcon } from '@heroicons/react/outline';
import type { TableProps } from 'components/table/component';
import Table from 'components/table/component';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { ColumnDefinition } from 'components/table/column';
import LineChart from 'components/chart/line';
import { BIG_NUMBER_FORMAT } from 'utils/number-format';

import type { ImpactTableData } from 'types';

type TableDataType = ImpactTableData['rows'][0];

type AnalysisTableProps = TableProps<TableDataType>;

const dataToCsv: (tableData: AnalysisTableProps) => string = (tableData) => {
  const LINE_SEPARATOR = '\r\n';

  if (!tableData) return null;
  let str = 'data:text/csv;charset=utf-8,';
  str +=
    tableData.columns
      // .filter(({ dataType }) => ['number', 'string'].includes(dataType))
      .map((column) => column.title || column.id)
      .join(';') + LINE_SEPARATOR;

  tableData.data.forEach(({ name, values }) => {
    const rowData: (string | number)[] = [name];
    values.forEach(({ value }) => {
      rowData.push(value);
    });

    str += rowData.join(';') + LINE_SEPARATOR;
  });

  return str;
};

const AnalysisTable: React.FC = () => {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 10,
  });
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const tableState = useMemo(
    () => ({ pagination: paginationState, sorting: sortingState }),
    [paginationState, sortingState],
  );
  const { scenarioToCompare, isComparisonEnabled } = useAppSelector(scenarios);

  // TODO: redo this
  const showComparison = useMemo(
    () => isComparisonEnabled && !!scenarioToCompare,
    [isComparisonEnabled, scenarioToCompare],
  );

  const {
    data: {
      data: { impactTable },
      metadata,
    },
    isLoading,
    isFetching,
  } = useImpactData({
    'page[number]': paginationState.pageIndex,
    'page[size]': paginationState.pageSize,
  });

  const totalRows = useMemo(() => {
    return !isLoading && impactTable.length === 1 ? impactTable[0].rows.length : impactTable.length;
  }, [isLoading, impactTable]);

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

  // Years from impact table
  const years = useMemo(() => {
    const result: number[] = [];
    impactTable.forEach(({ yearSum }) => {
      const years = (yearSum || []).map(({ year }) => year);
      years.forEach((year) => result.push(year));
    });
    return uniq(result);
  }, [impactTable]);

  const tableData = useMemo(
    () =>
      impactTable.map(({ indicatorShortName, yearSum, rows, ...impact }) => ({
        ...impact,
        children: rows,
        name: indicatorShortName,
        ...(yearSum && {
          values: yearSum.map((sum) => ({ ...sum, isProjected: false })),
        }),
      })),
    [impactTable],
  );

  const baseColumns = useMemo<ColumnDefinition<TableDataType, unknown>[]>(
    () => [
      {
        id: 'indicatorId',
        title: 'Name',
        fieldAccessor: (data) => data.name,
        align: 'left',
        isSticky: true,
        size: 260,
      },
      {
        id: 'datesRangeChart',
        fieldAccessor: (row) => row.values,
        title: 'Range',
        className: 'px-2 mx-auto',
        // style: { paddingLeft: 'inherit' },
        format: (value) => {
          const chartConfig = datesRangeChartConfig(value);
          return (
            <div className="h-20 overflow-hidden translate-y-1/3">
              <LineChart chartConfig={chartConfig} />
            </div>
          );
        },
      },
      ...years.map<ColumnDefinition<TableDataType, number>>((year) => ({
        id: `${year}`,
        title: `${year}`,
        fieldAccessor: (data) => {
          return data.values.find((value) => value.year === year).value;
        },
        format: BIG_NUMBER_FORMAT,
      })),
    ],
    [years],
  );

  const tableProps = useMemo<TableProps<TableDataType>>(
    () => ({
      getSubRows: (row) => row.children,
      state: tableState,
      onSortingChange: setSortingState,
      onPaginationChange: setPaginationState,
      totalItems: metadata.totalItems,
      pageCount: metadata.totalPages,
      isLoading: isFetching,
      data: tableData,
      columns: baseColumns,
    }),
    [baseColumns, isFetching, metadata.totalItems, metadata.totalPages, tableData, tableState],
  );
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

        <Table {...tableProps} />
      </div>
    </>
  );
};

export default AnalysisTable;
