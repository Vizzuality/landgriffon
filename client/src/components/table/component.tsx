import React, { useState, useEffect, useCallback, useMemo } from 'react';
import cx from 'classnames';
import { Table as KaTable, kaReducer } from 'ka-table';
import { updateData, updatePagesCount } from 'ka-table/actionCreators';
import type { SortingMode as kaSortingMode } from 'ka-table/enums';
import { ActionType, SortDirection } from 'ka-table/enums';
import type { DispatchFunc } from 'ka-table/types';

import DataRow from 'components/table/data-row';
import GroupRow from 'components/table/group-row';

import { useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';

import Loading from 'components/loading';

import { DEFAULT_CLASSNAMES, SHADOW_CLASSNAMES } from './constants';
import { SortingMode, ApiSortingDirection } from './enums';

import type { TableProps, ColumnProps, ApiSortingType } from './types';
import type { CustomChildComponents } from './types';
import Paging from './paging';

const defaultProps: TableProps = {
  columns: [],
  data: [],
  total: null,
  rowKeyField: 'id',
  sortingMode: SortingMode.None,
  // singleAction: loadData(),
};

const Table: React.FC<TableProps> = ({
  className,
  isLoading = false,
  stickyFirstColumn: isFirstColumnSticky = true,
  sortingMode,
  defaultSorting,
  onSortingChange,
  handleIndicatorRows = () => null,
  paging,
  onPageChange,
  onPageSizeChange,
  ...props
}) => {
  const firstColumnKey = props.columns[0]?.key;
  const stickyColumnKey = isFirstColumnSticky && firstColumnKey;
  const [tableProps, setTableProps] = useState<TableProps>({ ...defaultProps, ...props });
  const { indicator } = useAppSelector(analysisFilters);

  const [apiSorting, setApiSorting] = useState<ApiSortingType>({
    orderBy: defaultSorting?.orderBy || firstColumnKey,
    order: defaultSorting?.order || ApiSortingDirection.Ascending,
  });

  const indicatorsExpanded = useMemo(
    () => tableProps.data.filter(({ id }) => tableProps.treeGroupsExpanded?.find((d) => d === id)),
    [tableProps.data, tableProps.treeGroupsExpanded],
  );

  const indicatorRows = useMemo(
    () =>
      indicatorsExpanded.filter(
        (indicator) =>
          !indicator.parentId ||
          (!!indicator.parentId &&
            indicatorsExpanded.map((i) => i.id).includes(indicator.parentId)),
      ),
    [indicatorsExpanded],
  );

  const totalRows = useMemo(
    () =>
      indicatorRows.reduce((acc, i) => {
        if (!i.parentId && indicator.value === 'all') {
          return acc + i.indicatorRows;
        } else {
          return acc + i.indicatorChildrenRows.find((c) => c.name === i.name)?.childrenRows;
        }
      }, 0),
    [indicatorRows, indicator?.value],
  );

  const updateTableProps = useCallback(
    (action) => {
      // Data is loading; let's retain the existing props for now.
      if (isLoading) return;

      setTableProps((prevState) => kaReducer(prevState, action));
      const total = totalRows + props.total;
      handleIndicatorRows(total);
    },
    [isLoading, totalRows, props.total, handleIndicatorRows],
  );

  const handleApiSorting = useCallback(
    (action) => {
      const column = props.columns.find((column) => column.key === action.columnKey) as ColumnProps;
      const isSortable = column?.isSortable !== false;
      const isSameColumn = action.columnKey === apiSorting?.orderBy;
      const isCurrentAscending = apiSorting.order === ApiSortingDirection.Ascending;

      if (!isSortable) return;

      const { orderBy, order } = {
        orderBy: action.columnKey,
        order:
          isSameColumn && isCurrentAscending
            ? ApiSortingDirection.Descending
            : ApiSortingDirection.Ascending,
      };

      if (orderBy !== apiSorting.orderBy || order !== apiSorting.order) {
        onSortingChange({ orderBy, order });
      }

      setApiSorting({ orderBy, order });
    },
    [apiSorting.order, apiSorting.orderBy, onSortingChange, props.columns],
  );

  const dispatch: DispatchFunc = useCallback(
    (action) => {
      switch (action.type) {
        case ActionType.UpdateSortDirection:
          if (sortingMode === SortingMode.Api) {
            handleApiSorting(action);
          } else {
            updateTableProps(action);
          }
          break;
        default:
          updateTableProps(action);
      }
    },
    [handleApiSorting, sortingMode, updateTableProps],
  );

  useEffect(() => {
    // Data is loading; let's retain the existing data for now.
    if (isLoading) return;

    dispatch(updateData(props.data));
  }, [props.data, dispatch, isLoading]);

  useEffect(() => {
    // Data is loading; let's retain the existing columns for now.
    if (isLoading) return;
    const columns =
      sortingMode === SortingMode.Api
        ? props.columns.map((column) => ({
            ...column,
            ...(apiSorting.orderBy === column.key && {
              sortDirection:
                apiSorting.order === ApiSortingDirection.Ascending
                  ? SortDirection.Ascend
                  : SortDirection.Descend,
            }),
          }))
        : props.columns;
    setTableProps((tableProps) => ({ ...tableProps, columns }));
  }, [props.columns, apiSorting, sortingMode, isLoading]);

  const childComponents: CustomChildComponents = {
    tableWrapper: {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.tableWrapper,
      }),
      ...props.childComponents?.tableWrapper,
    },
    tableHead: {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.tableHead,
      }),
      ...props.childComponents?.tableHead,
    },
    headCell: {
      elementAttributes: (props) => {
        const isFirstColumn = props.column.key === firstColumnKey;
        const isSticky = isFirstColumnSticky && props.column.key === stickyColumnKey;
        const classNames = DEFAULT_CLASSNAMES.headCell;
        const isProjected = props.column.isFirstYearProjected;

        return {
          className: cx(classNames, {
            'text-center': !isFirstColumn,
            'sticky left-0 z-10 w-80': isSticky,
            'w-48': !isSticky,
            [SHADOW_CLASSNAMES]: isSticky,
            'border-l border-dashed border-gray-200': isProjected,
          }),
        };
      },
      ...props.childComponents?.headCell,
    },
    dataRow: {
      elementAttributes: (props) => ({
        className: cx(DEFAULT_CLASSNAMES.dataRow, {
          'border-l-2 border-green-700': props.isTreeExpanded || props.treeDeep > 0,
        }),
      }),
      content: (props) => (
        <DataRow
          {...props}
          firstColumnKey={firstColumnKey}
          isFirstColumnSticky={isFirstColumnSticky}
          stickyColumnKey={stickyColumnKey}
        />
      ),
      ...props.childComponents?.dataRow,
    },
    noDataRow: {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.noDataRow,
      }),
      ...props.childComponents?.noDataRow,
    },
    groupCell: {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.groupCell,
      }),
      ...props.childComponents?.groupCell,
    },
    groupRow: {
      content: (props) => <GroupRow {...props} sticky={isFirstColumnSticky} />,
      ...props.childComponents?.groupRow,
    },
    paging: {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.paging,
      }),
      content: (pagingProps) => (
        <Paging {...pagingProps} isLoading={isLoading} totalRows={paging.totalItems} />
      ),
      ...props.childComponents?.paging,
    },
    ...props.childComponents,
  };

  if (props.childComponents?.tableFoot) {
    childComponents.tableFoot = {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.tableFoot,
      }),
      ...props.childComponents?.tableFoot,
    };
  }

  if (props.childComponents?.summaryCell) {
    childComponents.summaryCell = {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.summaryCell,
      }),
    };
  }

  if (props.childComponents?.summaryRow) {
    childComponents.summaryRow = {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.summaryRow,
      }),
      ...props.childComponents?.summaryRow,
    };
  }

  useEffect(() => {
    if (paging?.pageSize === tableProps.paging?.pageSize || !tableProps.paging?.pageSize) return;
    onPageSizeChange(tableProps.paging.pageSize);
  }, [onPageSizeChange, paging?.pageSize, tableProps.paging?.pageSize]);

  useEffect(() => {
    dispatch(updatePagesCount(tableProps.paging?.pagesCount));
  }, [dispatch, tableProps.paging?.pagesCount]);

  useEffect(() => {
    if (!tableProps.paging?.pageIndex) return;
    onPageChange?.(tableProps.paging?.pageIndex);
  }, [onPageChange, tableProps.paging?.pageIndex]);

  return (
    <div
      className={cx('relative', className, {
        'my-4': !className,
      })}
    >
      {isLoading && (
        <div className="absolute top-0 bottom-0 left-0 right-0 z-30 flex flex-col items-center justify-center bg-white bg-opacity-60 backdrop-blur-xs">
          <Loading className="w-12 h-12" />
          <span className="mt-4 text-gray-600">Loading...</span>
        </div>
      )}
      <KaTable
        {...tableProps}
        paging={paging}
        sortingMode={sortingMode as kaSortingMode}
        childComponents={childComponents}
        dispatch={dispatch}
      />
    </div>
  );
};

export default Table;
