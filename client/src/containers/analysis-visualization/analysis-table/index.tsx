import { useCallback, useEffect, useMemo, useState } from 'react';
import { DownloadIcon, InformationCircleIcon } from '@heroicons/react/outline';
import { uniq, omit } from 'lodash-es';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/solid';
import { useSearchParams } from 'next/navigation';

import ComparisonCell from './comparison-cell/component';
import ChartCell from './chart-cell';
import AnalysisTableFooter from './footer';

import { useAppSelector, useSyncIndicators, useSyncTableDetailView } from 'store/hooks';
import { filtersForTabularAPI } from 'store/features/analysis/selector';
import { scenarios } from 'store/features/analysis/scenarios';
import { useIndicators } from 'hooks/indicators';
import {
  useImpactData,
  useDownloadImpactData,
  useDownloadImpactActualVsScenarioData,
  useDownloadImpactScenarioVsScenarioData,
} from 'hooks/impact';
import { useImpactComparison, useImpactScenarioComparison } from 'hooks/impact/comparison';
import AnalysisDynamicMetadata from 'containers/analysis-visualization/analysis-dynamic-metadata';
import { Button } from 'components/button';
import Table from 'components/table/component';
import { formatNumber } from 'utils/number-format';
import { DEFAULT_PAGE_SIZES } from 'components/table/pagination/constants';
import { handleResponseError } from 'services/api';

import type {
  ExpandedState,
  PaginationState,
  RowSelectionState,
  SortingState,
  TableState,
  Table as TableType,
} from '@tanstack/react-table';
import type { TableProps } from 'components/table/component';
import type { ColumnDefinition } from 'components/table/column';
import type { ChartData } from './chart-cell/types';
import type { ComparisonMode, ImpactRowType, ImpactTableValueItem } from './types';

const isParentRow = <Mode extends ComparisonMode>(
  row: ImpactRowType<Mode, true | false>,
): row is ImpactRowType<Mode, true> => {
  return 'metadata' in row;
};

const AnalysisTable = () => {
  const searchParams = useSearchParams();
  const isComparisonEnabled = Boolean(searchParams.get('compareScenarioId'));

  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: DEFAULT_PAGE_SIZES[0],
  });
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [expandedState, setExpandedState] = useState<ExpandedState>(null);
  const [rowSelectionState, setRowSelectionState] = useState<RowSelectionState>({});
  const tableState: Partial<TableState> = useMemo(() => {
    return {
      pagination: paginationState,
      sorting: sortingState,
      expanded: expandedState,
      rowSelection: rowSelectionState,
    };
  }, [expandedState, paginationState, rowSelectionState, sortingState]);

  const [syncedIndicators, setSyncedIndicators] = useSyncIndicators();
  const [syncedDetailView, setSyncedDetailView] = useSyncTableDetailView();

  const selectedIndicators = syncedIndicators;

  const { scenarioToCompare, currentScenario } = useAppSelector(scenarios);
  const { data: indicators } = useIndicators(undefined, { select: (data) => data?.data });
  const downloadImpactData = useDownloadImpactData({
    onSuccess: () => {
      toast.success('Data was downloaded successfully');
    },
    onError: handleResponseError,
  });

  const downloadActualVsScenarioData = useDownloadImpactActualVsScenarioData({
    onSuccess: () => {
      toast.success('Data was downloaded successfully');
    },
    onError: handleResponseError,
  });

  const downloadScenarioVsScenarioData = useDownloadImpactScenarioVsScenarioData({
    onSuccess: () => {
      toast.success('Data was downloaded successfully');
    },
    onError: handleResponseError,
  });

  const { indicatorId, ...restFilters } = useAppSelector(filtersForTabularAPI);

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

  const isEnable =
    !!indicators?.length &&
    !!restFilters.startYear &&
    !!restFilters.endYear &&
    restFilters.endYear !== restFilters.startYear;

  const indicatorIds = useMemo(() => {
    if (Array.isArray(selectedIndicators)) {
      return selectedIndicators.map((id) => id);
    }

    if (selectedIndicators && !Array.isArray(selectedIndicators)) {
      return [selectedIndicators];
    }

    return indicators.map((indicator) => indicator.id);
  }, [indicators, selectedIndicators]);

  const sortingParams = useMemo(() => {
    if (!!sortingState.length) {
      return {
        sortingYear: Number(sortingState?.[0].id),
        sortingOrder: sortingState[0].desc ? 'DESC' : 'ASC',
      };
    }
    return {};
  }, [sortingState]);

  const params = useMemo(
    () => ({
      indicatorIds,
      startYear: restFilters.startYear,
      endYear: restFilters.endYear,
      groupBy: restFilters.groupBy,
      ...restFilters,
      ...sortingParams,
      scenarioId: currentScenario,
      'page[number]': paginationState.pageIndex,
      'page[size]': paginationState.pageSize,
    }),
    [
      currentScenario,
      indicatorIds,
      paginationState.pageIndex,
      paginationState.pageSize,
      restFilters,
      sortingParams,
    ],
  );

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

  const firstProjectedYear = useMemo(() => {
    if (!impactTable) return null;
    return impactTable[0]?.rows[0]?.values.find((value) => value.isProjected)?.year;
  }, [impactTable]);

  const handleDownloadData = useCallback(async () => {
    let csv = null;
    // actual vs scenario
    if (!currentScenario && scenarioToCompare) {
      csv = await downloadActualVsScenarioData.mutateAsync({
        ...omit(params, 'page[number]', 'page[size]'),
        comparedScenarioId: scenarioToCompare,
      });
    }
    // scenario vs scenario
    else if (currentScenario && scenarioToCompare) {
      csv = await downloadScenarioVsScenarioData.mutateAsync({
        ...omit(params, 'page[number]', 'page[size]', 'scenarioId'),
        baseScenarioId: currentScenario,
        comparedScenarioId: scenarioToCompare,
      });
    }
    // no scenario or comparison
    else {
      csv = await downloadImpactData.mutateAsync(omit(params, 'page[number]', 'page[size]'));
    }

    if (csv) {
      const url = window.URL.createObjectURL(new Blob([csv]));
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `impact_data_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // do not pass pagination params to download data endpoint
  }, [
    currentScenario,
    downloadActualVsScenarioData,
    downloadImpactData,
    downloadScenarioVsScenarioData,
    params,
    scenarioToCompare,
  ]);

  const handleExpandedChange = useCallback(
    <Mode extends ComparisonMode>(table: TableType<ImpactRowType<Mode>>) => {
      if (!!expandedState) {
        const expandedIds = Object.keys(expandedState);
        const rowsToSelect = {};
        table
          .getRowModel()
          .rows.filter((row) => expandedIds.includes(row.id))
          .forEach((row) => {
            rowsToSelect[row.id] = true;
            row.originalSubRows.forEach(
              (_subRow, index) => (rowsToSelect[`${row.id}.${index}`] = true),
            );
          });
        setRowSelectionState(rowsToSelect);
      }
    },
    [expandedState],
  );

  // Years from impact table
  const years = useMemo(() => {
    // TODO: do we have to check all rows or is the first one guaranteed to have all years?
    // const years = impactTable[0]?.yearSum?.map((sum) => sum.year);
    const years = impactTable?.flatMap(({ yearSum }) => yearSum.map((sum) => sum.year));

    // TODO: if the above is true, we don't need this
    return uniq(years);
  }, [impactTable]);

  const initialTableData: ImpactRowType<ComparisonMode>[] = useMemo(
    () =>
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

  const [tableData, setTableData] = useState<ImpactRowType<ComparisonMode>[]>([]);

  useEffect(() => {
    // ? a single indicator is expanded
    if (syncedDetailView) {
      setTableData(initialTableData.find((row) => row.indicatorId === syncedDetailView)?.children);
    }

    //  ? several indicators are selected
    if (selectedIndicators && !syncedDetailView) {
      setTableData(initialTableData.filter((row) => selectedIndicators.includes(row.indicatorId)));
    }

    // ? all indicators are selected
    if (!selectedIndicators?.length && !syncedDetailView) {
      setTableData(initialTableData);
    }

    setExpandedState(null);
    setRowSelectionState({});
  }, [selectedIndicators, initialTableData, syncedDetailView]);

  const handleExitExpanded = useCallback(() => {
    setExpandedState({});
    setSyncedDetailView(null);

    if (syncedIndicators?.length === 1) {
      setSyncedIndicators(null);
    }
  }, [setSyncedDetailView, syncedIndicators, setSyncedIndicators]);

  const handleExpandRow = useCallback(
    (indicatorId: string) => {
      setExpandedState({});
      setSyncedDetailView(indicatorId);
    },
    [setSyncedDetailView],
  );

  const isComparison = useIsComparison(tableData);
  const isScenarioComparison = useIsScenarioComparison(tableData);

  const valueIsScenarioComparison = useCallback(
    (value: ImpactTableValueItem<ComparisonMode>): value is ImpactTableValueItem<'scenario'> => {
      return isScenarioComparison && isComparison;
    },
    [isComparison, isScenarioComparison],
  );

  const expanded = useMemo(() => {
    return indicators.find((i) => i.id === syncedDetailView);
  }, [syncedDetailView, indicators]);

  const comparisonColumn = useCallback(
    <Mode extends ComparisonMode>(year: number): ColumnDefinition<ImpactRowType<Mode>> => {
      const valueIsComparison = (
        value: ImpactTableValueItem<ComparisonMode>,
      ): value is ImpactTableValueItem<true> => {
        return !isScenarioComparison && isComparison;
      };

      return {
        header: () => <span className="text-gray-900">{year}</span>,
        id: `${year}`,
        size: 170,
        align: 'center',
        enableSorting: true,
        cell: ({ row: { original: data, id }, table }) => {
          //* The metadata is only present at the parent row, so we need to get it from there
          const { rowsById } = table.getExpandedRowModel();
          const parentRowData = rowsById[id.split('.')[0]].original as unknown as ImpactRowType<
            Mode,
            true
          >;

          const unit: string = parentRowData.metadata?.unit || expanded?.metadata?.units;

          const value = data.values?.find((value) => value.year === year);
          const isComparison = valueIsComparison(value);
          const isScenarioComparison = valueIsScenarioComparison(value);

          if (!isComparison && !isScenarioComparison) {
            if (unit) {
              return `${formatNumber(value.value)} ${unit}`;
            }
            return formatNumber(value?.value);
          }

          if (isScenarioComparison) {
            const { baseScenarioValue, comparedScenarioValue, ...rest } = value;
            return (
              <ComparisonCell
                {...rest}
                value={baseScenarioValue}
                scenarioValue={comparedScenarioValue}
                unit={unit}
                formatter={formatNumber}
                isFirs
              />
            );
          }

          return (
            <ComparisonCell
              {...value}
              scenarioValue={value.comparedScenarioValue}
              formatter={formatNumber}
            />
          );
        },
      };
    },
    [expanded, isComparison, isScenarioComparison, valueIsScenarioComparison],
  );

  const baseColumns = useMemo(
    <Mode extends ComparisonMode>(): ColumnDefinition<ImpactRowType<Mode>>[] => [
      {
        id: 'name',
        header: () => (
          <div>
            {!!expanded?.name ? (
              <Button
                className="border-0 bg-transparent pb-1 pl-0 pr-0 pt-1"
                variant="transparent"
                onClick={handleExitExpanded}
              >
                <div className="flex max-w-[200px] whitespace-normal text-start text-sm font-semibold text-gray-900">
                  <ArrowLeftIcon className="mr-3.5 h-4 w-4" />
                  {expanded.name}
                </div>
              </Button>
            ) : (
              <span className="block py-[0.70rem] text-sm normal-case text-gray-400">
                Selected Indicators
              </span>
            )}
          </div>
        ),
        align: 'left',
        isSticky: 'left',
        size: 260,
        cell: ({ row: { original, depth } }) => {
          const name =
            isParentRow(original) &&
            depth === 0 &&
            indicators.find((i) => i.id === original.indicatorId)?.metadata?.short_name;

          return (
            <div className="flex gap-4 py-5">
              {!expanded?.name && (
                <InformationCircleIcon className="h-4 w-4 shrink-0 text-gray-900" />
              )}
              <div>
                {expanded?.name ? (
                  original.name
                ) : (
                  <div className="block font-semibold">
                    {name || original.name}
                    {isParentRow(original) && depth === 0 && <> ({original.metadata.unit})</>}
                  </div>
                )}

                {!expanded?.name && isParentRow(original) && (
                  <Button
                    variant="white"
                    className="mt-4"
                    onClick={() => handleExpandRow(original.indicatorId)}
                  >
                    View detail
                  </Button>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: 'datesRangeChart',
        header: () => (
          <span className="text-gray-900">
            {years?.length ? `${years[0]}-${years[years.length - 1]}` : '-'}
          </span>
        ),
        className: 'px-2 mx-auto',
        align: 'center',
        size: 170,
        cell: ({
          row: {
            original: { values },
          },
        }) => {
          const chartData = values as ChartData[];
          return (
            <div className="mx-auto my-3 h-5 w-[130px]">
              <ChartCell data={chartData} />
            </div>
          );
        },
      },
      ...years.map((year) => comparisonColumn<Mode>(year as number)),
    ],
    [years, expanded?.name, handleExitExpanded, indicators, handleExpandRow, comparisonColumn],
  );

  const tableProps = useMemo(
    <Mode extends ComparisonMode>(): TableProps<ImpactRowType<Mode>> & {
      firstProjectedYear: number;
    } => ({
      showPagination: Boolean(syncedDetailView),
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
      enableExpanding: Boolean(syncedDetailView),
      data: (tableData as ImpactRowType<Mode>[]) || [],
      columns: baseColumns as ColumnDefinition<ImpactRowType<Mode>>[],
      handleExpandedChange,
      firstProjectedYear,
    }),
    [
      metadata,
      tableState,
      isFetching,
      tableData,
      baseColumns,
      handleExpandedChange,
      firstProjectedYear,
      syncedDetailView,
    ],
  );

  return (
    <div className="flex flex-1 flex-col space-y-6 px-6 pb-6">
      <div className="flex justify-between">
        <div className="flex w-full items-end justify-between">
          <AnalysisDynamicMetadata />
          <div>
            <Button
              variant="secondary"
              size="base"
              className="flex-shrink-0"
              disabled={
                isLoading ||
                downloadImpactData.isLoading ||
                downloadActualVsScenarioData.isLoading ||
                downloadScenarioVsScenarioData.isLoading
              }
              icon={<DownloadIcon />}
              onClick={handleDownloadData}
              loading={
                downloadImpactData.isLoading ||
                downloadActualVsScenarioData.isLoading ||
                downloadScenarioVsScenarioData.isLoading
              }
            >
              Download Data
            </Button>
          </div>
        </div>
      </div>
      <div className="relative flex-1" data-testid="analysis-table">
        <Table {...tableProps} />
      </div>
      {isComparisonEnabled && <AnalysisTableFooter />}
    </div>
  );
};

export default AnalysisTable;
