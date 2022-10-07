import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { DownloadIcon } from '@heroicons/react/outline';
import uniq from 'lodash/uniq';
import omit from 'lodash/omit';

import { useAppSelector } from 'store/hooks';
import { filtersForTabularAPI } from 'store/features/analysis/selector';
import { scenarios } from 'store/features/analysis/scenarios';
import { useIndicators } from 'hooks/indicators';
import { useImpactData } from 'hooks/impact';
import { useImpactComparison, useImpactScenarioComparison } from 'hooks/impact/comparison';

import AnalysisDynamicMetadata from 'containers/analysis-visualization/analysis-dynamic-metadata';
import LinkButton from 'components/button';
import Table from 'components/table/component';
import LineChart from 'components/chart/line';
import { BIG_NUMBER_FORMAT } from 'utils/number-format';
import ComparisonCell from './comparison-cell/component';

import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { TableProps } from 'components/table/component';
import type { ColumnDefinition } from 'components/table/column';
import type { LinesConfig } from 'components/chart/line/types';
import type { ComparisonData, ImpactData, ImpactTableData } from 'types';

type TableDataType = ImpactTableData['rows'][0];

type AnalysisTableProps = TableProps<TableDataType>;

const dataToCsv: (tableData: AnalysisTableProps) => string = (tableData) => {
  const LINE_SEPARATOR = '\r\n';

  if (!tableData) return null;
  let str = 'data:text/csv;charset=utf-8,';
  str +=
    tableData.columns
      // .filter(({ dataType }) => ['number', 'string'].includes(dataType))
      .map((column) => column.header || column.id)
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

  const { scenarioToCompare, isComparisonEnabled, currentScenario } = useAppSelector(scenarios);
  const { data: indicators } = useIndicators({ select: (data) => data.data });
  const filters = useAppSelector(filtersForTabularAPI);

  const showComparison = useMemo(
    () => isComparisonEnabled && !!scenarioToCompare,
    [isComparisonEnabled, scenarioToCompare],
  );

  const { indicatorId, ...restFilters } = filters;

  const isEnable =
    !!indicatorId &&
    !!indicators?.length &&
    !!filters.startYear &&
    !!filters.endYear &&
    filters.endYear !== filters.startYear;

  const indicatorIds = useMemo(() => {
    if (indicatorId === 'all') {
      return indicators.map((indicator) => indicator.id);
    }
    if (indicatorId) return [indicatorId];
    return [];
  }, [indicators, indicatorId]);

  const params = {
    indicatorIds,
    startYear: filters.startYear,
    endYear: filters.endYear,
    groupBy: filters.groupBy,
    ...restFilters,
    scenarioId: currentScenario,
    scenarioToCompare,
    'page[number]': paginationState.pageIndex,
    'page[size]': paginationState.pageSize,
  };

  const plainImpactData = useImpactData(params, {
    enabled: !isComparisonEnabled && isEnable,
  });

  const impactActualComparisonData = useImpactComparison(params, {
    enabled: isComparisonEnabled && !currentScenario && isEnable,
  });
  const impactScenarioComparisonData = useImpactScenarioComparison(
    {
      scenarioOneValue: currentScenario,
      scenarioTwoValue: scenarioToCompare,
      ...omit(params, ['scenarioId', 'scenarioToCompare']),
    },
    {
      enabled: isComparisonEnabled && !!currentScenario && isEnable,
      select: ({ data: { scenarioVsScenarioImpactTable, ...data }, ...rest }) => {
        return {
          ...rest,
          data: {
            ...data,
            impactTable: scenarioVsScenarioImpactTable,
          },
        };
      },
    },
  );

  const getIsScenarioComparison = useCallback(
    (impactTable: ImpactTableData[] | ComparisonData[]): impactTable is ComparisonData[] => {
      return isComparisonEnabled && !!currentScenario;
    },
    [currentScenario, isComparisonEnabled],
  );
  const impactComparisonData = !!currentScenario
    ? impactScenarioComparisonData
    : impactActualComparisonData;

  const {
    data: {
      data: { impactTable },
      metadata,
    },
    isLoading,
    isFetching,
  } = useMemo(() => {
    if (isComparisonEnabled && !!scenarioToCompare) return impactComparisonData;
    return plainImpactData;
  }, [impactComparisonData, plainImpactData, isComparisonEnabled, scenarioToCompare]);

  const isScenarioComparison = getIsScenarioComparison(impactTable);

  const totalRows = useMemo(() => {
    return !isLoading && impactTable.length === 1 ? impactTable[0].rows.length : impactTable.length;
  }, [isLoading, impactTable]);

  const datesRangeChartConfig = (data, config: Pick<LinesConfig, 'dataKey' | 'stroke'>) => {
    const xAxisValues = data.map(({ x }) => x);
    const xMaxValue = Math.max(...xAxisValues);
    const xMinValue = Math.min(...xAxisValues);
    const min = xMaxValue - xMinValue;

    const { dataKey, stroke } = config;

    return {
      lines: [
        {
          stroke,
          width: '100%',
          strokeDasharray: '3 3',
          dataKey: `${dataKey}_path`,
          data,
        },
        {
          stroke,
          width: '100%',
          dataKey: `${dataKey}_values`,
          data: data.filter(({ x }) => x < xMinValue + min / 2),
        },
      ],
    };
  };

  // Years from impact table
  const years = useMemo(() => {
    // TODO: do we have to check all rows or is the first one guaranteed to have all years?
    // const years = impactTable[0]?.yearSum?.map((sum) => sum.year);
    const years = ((impactTable || []) as ImpactTableData[])?.flatMap(({ yearSum }) =>
      yearSum.map((sum) => sum.year),
    );

    // TODO: if the above is true, we don't need this
    return uniq(years);
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

  const comparisonColumn = useCallback<(year: number) => ColumnDefinition<TableDataType>>(
    (year: number) => {
      return {
        id: `${year}`,
        title: `${year}`,
        enableSorting: !showComparison,
        cell: ({ row: { original: data } }) => {
          const value = data.values.find((value) => value.year === year) as Required<
            TableDataType['values'][0]
          >;
          if (!showComparison) return BIG_NUMBER_FORMAT(value.value);

          if (isScenarioComparison) {
            console.log({ value });
            return BIG_NUMBER_FORMAT(value.value);
          }
          return <ComparisonCell {...value} />;
        },
      };
    },
    [showComparison],
  );

  const baseColumns = useMemo<ColumnDefinition<TableDataType>[]>(
    () => [
      {
        id: 'name',
        header: '',
        align: 'left',
        isSticky: true,
        size: 260,
        cell: ({ row: { original, depth } }) => {
          return (
            <>
              <span
                className={classNames({
                  'font-bold': depth === 0,
                })}
                title={original.name}
              >
                {/* @ts-expect-error the parent and the children have different data types */}
                {`${original.name} ${depth === 0 ? `(${original.metadata.unit})` : ''}`}
              </span>
            </>
          );
        },
      },
      {
        id: 'datesRangeChart',
        header: years?.length ? `${years[0]}-${years[years.length - 1]}` : '-',
        className: 'px-2 mx-auto',
        cell: ({
          row: {
            original: { values },
          },
        }) => {
          const actualData = values.map(({ year, value }) => ({
            x: year,
            y: value,
          }));
          const actualDataChartConfig = datesRangeChartConfig(actualData, {
            dataKey: 'actual_data',
            // ? gray/400 or gray/500
            stroke: showComparison ? '#AEB1B5' : '#60626A',
          });
          const interventionData = showComparison
            ? values.map(({ year, scenarioValue }) => ({
                x: year,
                y: scenarioValue,
              }))
            : [];
          const interventionDataChartConfig = showComparison
            ? datesRangeChartConfig(interventionData, {
                dataKey: 'intervention',
                // ? gray/900
                stroke: '#15181F',
              })
            : null;

          return (
            <div className="h-20 overflow-hidden">
              <LineChart
                margin={{
                  left: 0,
                  top: 20,
                  bottom: 20,
                  right: 20,
                }}
                chartConfig={{
                  lines: [
                    ...actualDataChartConfig.lines,
                    ...(showComparison ? interventionDataChartConfig.lines : []),
                  ],
                }}
              />
            </div>
          );
        },
      },
      ...years.map((year) => comparisonColumn(year)),
    ],
    [comparisonColumn, years, showComparison],
  );

  const tableProps = useMemo<TableProps<TableDataType>>(
    () => ({
      paginationProps: {
        totalItems: totalRows,
        itemNumber: tableData.length,
        pageCount: metadata.totalPages,
      },
      getSubRows: (row) => row.children,
      state: tableState,
      onSortingChange: setSortingState,
      onPaginationChange: setPaginationState,
      isLoading: isFetching,
      data: tableData,
      columns: baseColumns,
      manualSorting: false,
    }),
    [baseColumns, isFetching, metadata.totalPages, tableData, tableState, totalRows],
  );
  const csv = useMemo<string | null>(() => encodeURI(dataToCsv(tableProps)), [tableProps]);

  return (
    <>
      <div className="flex justify-between px-6 xl:pl-12">
        <div className="flex items-end justify-between w-full">
          <AnalysisDynamicMetadata />
          <div>
            <LinkButton
              href={csv}
              variant="secondary"
              size="base"
              className="flex-shrink-0"
              disabled={isLoading}
              download="report.csv"
              icon={<DownloadIcon />}
            >
              Download Data
            </LinkButton>
            <div className="mt-3 font-sans text-xs font-bold leading-4 text-right text-gray-500 uppercase">
              Total {totalRows} {totalRows === 1 ? 'row' : 'rows'}
            </div>
          </div>
        </div>
      </div>
      <div className="relative px-6 mt-5 xl:pl-12">
        <Table {...tableProps} />
      </div>
    </>
  );
};

export default AnalysisTable;
