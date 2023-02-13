import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { DownloadIcon } from '@heroicons/react/outline';
import { uniq, omit } from 'lodash-es';

import ComparisonCell from './comparison-cell/component';
import ChartCell from './chart-cell';

import { useAppSelector } from 'store/hooks';
import { filtersForTabularAPI } from 'store/features/analysis/selector';
import { scenarios } from 'store/features/analysis/scenarios';
import { useIndicators } from 'hooks/indicators';
import { useImpactData } from 'hooks/impact';
import { useImpactComparison, useImpactScenarioComparison } from 'hooks/impact/comparison';
import AnalysisDynamicMetadata from 'containers/analysis-visualization/analysis-dynamic-metadata';
import { Anchor } from 'components/button';
import Table from 'components/table/component';
import { NUMBER_FORMAT } from 'utils/number-format';
import { DEFAULT_PAGE_SIZES } from 'components/table/pagination/constants';

import type { ExpandedState, PaginationState, SortingState } from '@tanstack/react-table';
import type { TableProps } from 'components/table/component';
import type { ColumnDefinition } from 'components/table/column';
import type { ChartData } from './chart-cell/types';
import type { ComparisonMode, ImpactRowType, ImpactTableValueItem } from './types';

type AnalysisTableProps<Mode extends ComparisonMode> = TableProps<ImpactRowType<Mode>>;

const NUMBER_FORMATTER = NUMBER_FORMAT;

const isParentRow = <Mode extends ComparisonMode>(
  row: ImpactRowType<Mode, true | false>,
): row is ImpactRowType<Mode, true> => {
  return 'metadata' in row;
};

const dataToCsv = <Mode extends ComparisonMode>(tableData: AnalysisTableProps<Mode>): string => {
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
    (values as unknown[] as ImpactRowType<false>['values']).forEach(({ value }) => {
      rowData.push(value);
    });

    str += rowData.join(';') + LINE_SEPARATOR;
  });

  return str;
};

const AnalysisTable = () => {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZES[0],
  });
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [expandedState, setExpandedState] = useState<ExpandedState>({});
  const tableState = useMemo(
    () => ({ pagination: paginationState, sorting: sortingState, expanded: expandedState }),
    [expandedState, paginationState, sortingState],
  );

  const { scenarioToCompare, isComparisonEnabled, currentScenario } = useAppSelector(scenarios);
  const { data: indicators } = useIndicators(
    { 'filter[status]': 'active' },
    { select: (data) => data.data },
  );
  const filters = useAppSelector(filtersForTabularAPI);

  const useIsComparison = useCallback(
    (table: ImpactRowType<ComparisonMode>[]): table is ImpactRowType<true | 'scenario'>[] => {
      return isComparisonEnabled && !!scenarioToCompare;
    },
    [isComparisonEnabled, scenarioToCompare],
  );

  const useIsScenarioComparison = useCallback(
    (table: ImpactRowType<ComparisonMode>[]): table is ImpactRowType<'scenario'>[] => {
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
    'page[number]': paginationState.pageIndex,
    'page[size]': paginationState.pageSize,
  };

  const plainImpactData = useImpactData(params, {
    enabled: !isComparisonEnabled && isEnable,
  });

  const impactActualComparisonData = useImpactComparison(
    { ...omit(params, 'scenarioId'), comparedScenarioId: scenarioToCompare },
    {
      enabled: isComparisonEnabled && !currentScenario && isEnable,
    },
  );
  const impactScenarioComparisonData = useImpactScenarioComparison(
    {
      ...omit(params, 'scenarioId'),
      baseScenarioId: currentScenario,
      comparedScenarioId: scenarioToCompare,
    },
    {
      enabled: isComparisonEnabled && !!currentScenario && isEnable,
    },
  );

  const impactComparisonData = !!currentScenario
    ? impactScenarioComparisonData
    : impactActualComparisonData;

  const {
    data: impactData,
    isLoading,
    isFetching,
  } = useMemo(() => {
    if (isComparisonEnabled && !!scenarioToCompare) return impactComparisonData;
    return plainImpactData;
  }, [impactComparisonData, plainImpactData, isComparisonEnabled, scenarioToCompare]);

  const {
    data: { impactTable = [] },
    metadata,
  } = useMemo(() => {
    if (impactData) return impactData;
    return { data: { impactTable: [] }, metadata: {} };
  }, [impactData]);

  // Total rows count
  const [totalRows, setTotalRows] = useState<number>(0);
  const handleExpandedChange = useCallback((table) => {
    setTotalRows(table.getRowModel().rows.length);
  }, []);

  // Years from impact table
  const years = useMemo(() => {
    // TODO: do we have to check all rows or is the first one guaranteed to have all years?
    // const years = impactTable[0]?.yearSum?.map((sum) => sum.year);
    const years = impactTable?.flatMap(({ yearSum }) => yearSum.map((sum) => sum.year));

    // TODO: if the above is true, we don't need this
    return uniq(years);
  }, [impactTable]);

  const tableData = useMemo(
    <Mode extends ComparisonMode>(): ImpactRowType<Mode>[] =>
      impactTable.map(({ indicatorShortName, yearSum, rows, ...impact }) => ({
        ...impact,
        children: rows,
        name: indicatorShortName,
        ...(yearSum && {
          values: yearSum.map((sum) => ({
            ...sum,
            isProjected: rows[0]?.values.find((v) => v.year === sum.year)?.isProjected,
          })),
        }),
      })),
    [impactTable],
  );

  const isComparison = useIsComparison(tableData);
  const isScenarioComparison = useIsScenarioComparison(tableData);

  const valueIsScenarioComparison = useCallback(
    (value: ImpactTableValueItem<ComparisonMode>): value is ImpactTableValueItem<'scenario'> => {
      return isScenarioComparison && isComparison;
    },
    [isComparison, isScenarioComparison],
  );

  const comparisonColumn = useCallback(
    <Mode extends ComparisonMode>(year: number): ColumnDefinition<ImpactRowType<Mode>> => {
      const valueIsComparison = (
        value: ImpactTableValueItem<ComparisonMode>,
      ): value is ImpactTableValueItem<true> => {
        return !isScenarioComparison && isComparison;
      };

      return {
        id: `${year}`,
        size: 170,
        align: 'left',
        // TODO: restore when the API supports it
        // enableSorting: !isComparison,
        cell: ({ row: { original: data, id }, table }) => {
          //* The metadata is only present at the parent row, so we need to get it from there
          const { rowsById } = table.getExpandedRowModel();
          const parentRowData = rowsById[id.split('.')[0]].original as unknown as ImpactRowType<
            Mode,
            true
          >;

          const unit: string = parentRowData.metadata?.unit;

          const value = data.values.find((value) => value.year === year);
          const isComparison = valueIsComparison(value);
          const isScenarioComparison = valueIsScenarioComparison(value);

          if (!isComparison && !isScenarioComparison) {
            if (unit) {
              return `${NUMBER_FORMATTER(value.value)} ${unit}`;
            }
            return NUMBER_FORMATTER(value.value);
          }

          if (isScenarioComparison) {
            const { baseScenarioValue, comparedScenarioValue, ...rest } = value;
            return (
              <ComparisonCell
                {...rest}
                value={baseScenarioValue}
                scenarioValue={comparedScenarioValue}
                unit={unit}
                formatter={NUMBER_FORMATTER}
              />
            );
          }

          return (
            <ComparisonCell
              {...value}
              scenarioValue={value.comparedScenarioValue}
              formatter={NUMBER_FORMATTER}
            />
          );
        },
      };
    },
    [isComparison, isScenarioComparison, valueIsScenarioComparison],
  );

  const baseColumns = useMemo(
    <Mode extends ComparisonMode>(): ColumnDefinition<ImpactRowType<Mode>>[] => [
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
          const chartData = values as ChartData[];

          return (
            <div className="h-20 overflow-hidden">
              <ChartCell data={chartData} />
            </div>
          );
        },
      },
      ...years.map((year) => comparisonColumn<Mode>(year as number)),
    ],
    [years, comparisonColumn],
  );

  const tableProps = useMemo(
    <Mode extends ComparisonMode>(): TableProps<ImpactRowType<Mode>> => ({
      paginationProps: {
        totalItems: metadata.totalItems,
        totalPages: metadata.totalPages,
        currentPage: metadata.page,
        pageSize: metadata.size,
      },
      getSubRows: (row) => row.children,
      state: tableState,
      onSortingChange: setSortingState,
      onPaginationChange: setPaginationState,
      onExpandedChange: setExpandedState,
      isLoading: isFetching,
      data: tableData as ImpactRowType<Mode>[],
      columns: baseColumns as ColumnDefinition<ImpactRowType<Mode>>[],
      handleExpandedChange,
    }),
    [
      baseColumns,
      handleExpandedChange,
      isFetching,
      metadata.page,
      metadata.size,
      metadata.totalItems,
      metadata.totalPages,
      tableData,
      tableState,
    ],
  );

  const csv = useMemo<string | null>(() => encodeURI(dataToCsv(tableProps)), [tableProps]);

  return (
    <>
      <div className="flex justify-between px-6">
        <div className="flex items-end justify-between w-full">
          <AnalysisDynamicMetadata />
          <div>
            <Anchor
              href={csv}
              variant="secondary"
              size="base"
              className="flex-shrink-0"
              disabled={isLoading}
              download="report.csv"
              icon={<DownloadIcon />}
            >
              Download Data
            </Anchor>
            <div className="mt-3 font-sans text-xs font-bold leading-4 text-right text-gray-500 uppercase">
              Total {totalRows} {totalRows === 1 ? 'row' : 'rows'}
            </div>
          </div>
        </div>
      </div>
      <div className="relative px-6 my-6" data-testid="analysis-table">
        <Table {...tableProps} />
      </div>
    </>
  );
};

export default AnalysisTable;
