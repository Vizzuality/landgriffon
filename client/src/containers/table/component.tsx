import React, { useState, useEffect, useCallback } from 'react';
import cx from 'classnames';
import { Table as KaTable, kaReducer } from 'ka-table';
import { updateData } from 'ka-table/actionCreators';
import { ActionType, SortingMode as kaSortingMode, SortDirection } from 'ka-table/enums';
import { DispatchFunc } from 'ka-table/types';

import GroupRow from 'containers/table/group-row';
import HeadCellContent from 'containers/table/head-cell-content';
import LineChartCell from 'containers/table/line-chart-cell';

import Loading from 'components/loading';

import { DEFAULT_CLASSNAMES, SHADOW_CLASSNAMES } from './constants';
import { TableProps, ColumnProps, ApiSortingType } from './types';
import { SortingMode, ApiSortingDirection } from './enums';

const defaultProps: TableProps = {
  columns: [],
  data: [],
  rowKeyField: 'id',
  sortingMode: SortingMode.None,
};

const Table: React.FC<TableProps> = ({
  className,
  isLoading = false,
  stickyFirstColumn: isFirstColumnSticky = true,
  sortingMode,
  defaultSorting,
  onSortingChange,
  ...props
}: TableProps) => {
  const firstColumnKey = props.columns[0]?.key;
  const stickyColumnKey = isFirstColumnSticky && firstColumnKey;

  const [tableProps, setTableProps] = useState({ ...defaultProps, ...props });
  const [apiSorting, setApiSorting] = useState<ApiSortingType>({
    orderBy: defaultSorting?.orderBy || firstColumnKey,
    order: defaultSorting?.order || ApiSortingDirection.Ascending,
  });

  const updateTableProps = useCallback(
    (action) => {
      // Data is loading; let's retain the existing props for now.
      if (isLoading) return;
      setTableProps((prevState) => kaReducer(prevState, action));
    },
    [isLoading],
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
          return;
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

  const childComponents = {
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
    tableFoot: {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.tableFoot,
      }),
      ...props.childComponents?.tableFoot,
    },
    headCell: {
      elementAttributes: (props) => {
        const isFirstColumn = props.column.key === firstColumnKey;
        const isSticky = isFirstColumnSticky && props.column.key === stickyColumnKey;
        const isSortable = props.column.isSortable !== false;
        const classNames = DEFAULT_CLASSNAMES.headCell;

        return {
          className: cx(classNames, {
            'text-center': !isFirstColumn,
            'sticky left-0 z-10 w-80': isSticky,
            'cursor-default': !isSortable,
            'cursor-pointer': isSortable,
            [SHADOW_CLASSNAMES]: isSticky,
          }),
        };
      },
      ...props.childComponents?.headCell,
    },
    headCellContent: {
      elementAttributes: (props) => {
        const isSortable = props.column.isSortable !== false;
        const classNames = DEFAULT_CLASSNAMES.headCellContent;

        return {
          className: cx(classNames, {
            'cursor-text': !isSortable,
            'cursor-pointer': isSortable,
          }),
        };
      },
      content: HeadCellContent,
      ...props.childComponents?.headCellContent,
    },
    dataRow: {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.dataRow,
      }),
      ...props.childComponents?.dataRow,
    },
    cell: {
      elementAttributes: (props) => {
        const isFirstColumn = props.column.key === firstColumnKey;
        const isSticky = isFirstColumnSticky && props.column.key === stickyColumnKey;
        const classNames = DEFAULT_CLASSNAMES.cell;

        return {
          className: cx(classNames, {
            'text-center': !isFirstColumn,
            'sticky left-0 z-10 w-80': isSticky,
            [SHADOW_CLASSNAMES]: isSticky,
          }),
        };
      },
      content: (props) => {
        switch ((props.column as ColumnProps).type) {
          case 'line-chart':
            return <LineChartCell {...props} />;
          default:
            return;
        }
      },
      ...props.childComponents?.cell,
    },
    cellText: {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.cellText,
      }),
      ...props.childComponents?.cellText,
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
    summaryCell: {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.summaryCell,
      }),
      ...props.childComponents?.summaryCell,
    },
    summaryRow: {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.summaryRow,
      }),
      ...props.childComponents?.summaryRow,
    },
  };

  return (
    <div
      className={cx('relative', className, {
        'my-4 shadow-sm': !className,
      })}
    >
      {isLoading && (
        <div className="absolute top-0 right-0 bottom-0 left-0 z-30 bg-white bg-opacity-60 backdrop-blur-xs flex flex-col items-center justify-center">
          <Loading className="w-12 h-12" />
          <span className="mt-4 text-gray-600">Loading...</span>
        </div>
      )}
      <KaTable
        {...tableProps}
        sortingMode={sortingMode as kaSortingMode}
        childComponents={childComponents}
        dispatch={dispatch}
      />
    </div>
  );
};

export default Table;
