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
import { NUMBER_FORMAT } from 'utils/number-format';
import ComparisonCell from './comparison-cell/component';

import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { TableProps } from 'components/table/component';
import type { ColumnDefinition } from 'components/table/column';
import type { LinesConfig } from 'components/chart/line/types';
import type { ImpactRowType, ImpactTableValueItem, TableComparisonMode } from 'types';

type AnalysisTableProps<Comparison extends TableComparisonMode> = TableProps<
  ImpactRowType<Comparison>
>;

const NUMBER_FORMATTER = NUMBER_FORMAT;

const isParentRow = <Comparison extends TableComparisonMode>(
  row: ImpactRowType<Comparison, any>,
): row is ImpactRowType<Comparison, true> => {
  return 'metadata' in row;
};

const valueIsComparison = (
  value: ImpactTableValueItem<any>,
): value is ImpactTableValueItem<true | 'scenario'> => {
  return !('value' in value);
};

const dataToCsv = <Comparison extends TableComparisonMode>(
  tableData: AnalysisTableProps<Comparison>,
): string => {
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

const AnalysisTable = () => {
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

  const useIsComparison = useCallback(
    (table: ImpactRowType<TableComparisonMode>[]): table is ImpactRowType<true | 'scenario'>[] => {
      return isComparisonEnabled && !!scenarioToCompare;
    },
    [isComparisonEnabled, scenarioToCompare],
  );

  const useIsScenarioComparison = useCallback(
    (table: ImpactRowType<any>[]): table is ImpactRowType<'scenario'>[] => {
      return isComparisonEnabled && !!currentScenario;
    },
    [isComparisonEnabled, currentScenario],
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

  const impactActualComparisonData = useImpactComparison(
    { ...params, scenarioId: scenarioToCompare },
    {
      enabled: isComparisonEnabled && !currentScenario && isEnable,
    },
  );
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

  const impactComparisonData = !!currentScenario
    ? impactScenarioComparisonData
    : impactActualComparisonData;

  const {
    data: {
      data: { impactTable = [] },
      metadata,
    },
    isLoading,
    isFetching,
  } = useMemo(() => {
    if (isComparisonEnabled && !!scenarioToCompare) return impactComparisonData;
    return plainImpactData;
  }, [impactComparisonData, plainImpactData, isComparisonEnabled, scenarioToCompare]);

  const totalRows = useMemo(() => {
    return !isLoading && impactTable.length === 1 ? impactTable[0].rows.length : impactTable.length;
  }, [isLoading, impactTable]);

  const datesRangeChartConfig = (
    data,
    { dataKey, ...config }: Pick<LinesConfig, 'dataKey' | 'className'>,
  ) => {
    const xAxisValues = data.map(({ x }) => x);
    const xMaxValue = Math.max(...xAxisValues);
    const xMinValue = Math.min(...xAxisValues);
    const min = xMaxValue - xMinValue;

    return {
      lines: [
        {
          width: '100%',
          strokeDasharray: '3 3',
          dataKey: `${dataKey}_path`,
          data,
          ...config,
        },
        {
          width: '100%',
          dataKey: `${dataKey}_values`,
          data: data.filter(({ x }) => x < xMinValue + min / 2),
          ...config,
        },
      ],
    };
  };

  // Years from impact table
  const years = useMemo(() => {
    // TODO: do we have to check all rows or is the first one guaranteed to have all years?
    // const years = impactTable[0]?.yearSum?.map((sum) => sum.year);
    const years = impactTable?.flatMap(({ yearSum }) => yearSum.map((sum) => sum.year));

    // TODO: if the above is true, we don't need this
    return uniq(years);
  }, [impactTable]);

  const tableData = useMemo(
    <Comparison extends TableComparisonMode>(): ImpactRowType<Comparison>[] =>
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

  const isComparison = useIsComparison(tableData);
  const isScenarioComparison = useIsScenarioComparison(tableData);

  const valueIsScenarioComparison = useCallback(
    (value: ImpactTableValueItem<any>): value is ImpactTableValueItem<'scenario'> => {
      return isScenarioComparison && isComparison;
    },
    [isComparison, isScenarioComparison],
  );

  const comparisonColumn = useCallback(
    <Comparison extends TableComparisonMode>(
      year: number,
    ): ColumnDefinition<ImpactRowType<Comparison>> => {
      return {
        id: `${year}`,
        size: 170,
        align: 'left',
        enableSorting: !isComparison,
        cell: ({ row: { original: data, id }, table }) => {
          //* The metadata is only present at the parent row, so we need to get it from there
          const { rowsById } = table.getExpandedRowModel();
          const parentRowData = rowsById[id.split('.')[0]].original as unknown as ImpactRowType<
            Comparison,
            true
          >;

          const unit: string = parentRowData.metadata?.unit;

          const value = data.values.find((value) => value.year === year);
          const isComparison = valueIsComparison(value);
          const isScenarioComparison = valueIsScenarioComparison(value);
          if (!isComparison) {
            if (unit) {
              return `${NUMBER_FORMATTER(value.value)} ${unit}`;
            }
            return NUMBER_FORMATTER(value.value);
          }

          if (isScenarioComparison) {
            const { scenarioOneValue, scenarioTwoValue, ...rest } = value;
            return (
              <ComparisonCell
                {...rest}
                value={scenarioOneValue}
                scenarioValue={scenarioTwoValue}
                unit={unit}
                formatter={NUMBER_FORMATTER}
              />
            );
          }

          return <ComparisonCell {...value} formatter={NUMBER_FORMATTER} />;
        },
      };
    },
    [isComparison, valueIsScenarioComparison],
  );

  const baseColumns = useMemo(
    <Comparison extends TableComparisonMode>(): ColumnDefinition<ImpactRowType<Comparison>>[] => [
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
                {original.name}
                {isParentRow(original) && depth === 0 && <> ({original.metadata.unit})</>}
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
          const baseData = values.map((value: ImpactTableValueItem<Comparison>) => ({
            x: value.year,
            y: valueIsScenarioComparison(value) ? value.scenarioOneValue : value.value,
          }));

          const actualDataChartConfig = datesRangeChartConfig(baseData, {
            dataKey: 'actual_data',
            className: isComparison ? 'stroke-gray-400' : 'stroke-gray-500',
          });

          const interventionData = isComparison
            ? (values as ImpactTableValueItem<true | 'scenario'>[]).map((value) => {
                const isScenarioComparison = valueIsScenarioComparison(value);
                if (isScenarioComparison) {
                  return {
                    x: value.year,
                    y: value.scenarioTwoValue,
                  };
                }
                return {
                  x: value.year,
                  y: value.scenarioValue,
                };
              })
            : [];
          const interventionDataChartConfig = isComparison
            ? datesRangeChartConfig(interventionData, {
                dataKey: 'intervention',
                className: 'stroke-gray-900',
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
                    ...(isComparison ? interventionDataChartConfig.lines : []),
                  ],
                }}
              />
            </div>
          );
        },
      },
      ...years.map((year) => comparisonColumn<Comparison>(year)),
    ],
    [years, isComparison, valueIsScenarioComparison, comparisonColumn],
  );

  const tableProps = useMemo(
    <Comparison extends TableComparisonMode>(): TableProps<ImpactRowType<Comparison>> => ({
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
      data: tableData as ImpactRowType<Comparison>[],
      columns: baseColumns as ColumnDefinition<ImpactRowType<Comparison>>[],
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
