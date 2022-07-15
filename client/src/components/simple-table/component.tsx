import { FC, useEffect, useState } from 'react';
import { Table, kaReducer } from 'ka-table';
import { DataType, EditingMode, SortingMode } from 'ka-table/enums';

import { DEFAULT_CLASSNAMES, SHADOW_CLASSNAMES } from 'components/table/constants';

import type { ITableProps } from 'ka-table';
import type { DispatchFunc } from 'ka-table/types';

const defaultProps: ITableProps = {
  columns: [],
  data: [],
  rowKeyField: 'id',
  editingMode: EditingMode.None,
  sortingMode: SortingMode.SingleRemote,
  paging: {
    enabled: false,
  },
};

const SimpleTable: FC<ITableProps> = (props) => {
  const tablePropsInit = { ...defaultProps, ...props };
  const [tableProps, changeTableProps] = useState(tablePropsInit);

  // dispatch has an *action as an argument
  const dispatch: DispatchFunc = (action) => {
    // *kaReducer returns new *props according to previous state and *action, and saves new props to the state
    changeTableProps((prevState: ITableProps) => kaReducer(prevState, action));
  };

  useEffect(() => changeTableProps(props), [props]);

  // const childComponents: CustomChildComponents = {
  //   tableWrapper: {
  //     elementAttributes: () => ({
  //       className: DEFAULT_CLASSNAMES.tableWrapper,
  //     }),
  //     ...props.childComponents?.tableWrapper,
  //   },
  //   tableHead: {
  //     elementAttributes: () => ({
  //       className: DEFAULT_CLASSNAMES.tableHead,
  //     }),
  //     ...props.childComponents?.tableHead,
  //   },
  //   headCell: {
  //     elementAttributes: (props) => {
  //       const isFirstColumn = props.column.key === firstColumnKey;
  //       const isSticky = isFirstColumnSticky && props.column.key === stickyColumnKey;
  //       const classNames = DEFAULT_CLASSNAMES.headCell;
  //       const isProjected = props.column.isFirstYearProjected;

  //       return {
  //         className: cx(classNames, {
  //           'text-center': !isFirstColumn,
  //           'sticky left-0 z-10 w-80': isSticky,
  //           'w-48': !isSticky,
  //           [SHADOW_CLASSNAMES]: isSticky,
  //           'border-l border-dashed border-gray-200': isProjected,
  //         }),
  //       };
  //     },
  //     ...props.childComponents?.headCell,
  //   },
  //   dataRow: {
  //     elementAttributes: (props) => ({
  //       className: cx(DEFAULT_CLASSNAMES.dataRow, {
  //         'border-l-2 border-green-700': props.isTreeExpanded || props.treeDeep > 0,
  //       }),
  //     }),
  //     content: (props) => (
  //       <DataRow
  //         {...props}
  //         firstColumnKey={firstColumnKey}
  //         isFirstColumnSticky={isFirstColumnSticky}
  //         stickyColumnKey={stickyColumnKey}
  //       />
  //     ),
  //     ...props.childComponents?.dataRow,
  //   },
  //   noDataRow: {
  //     elementAttributes: () => ({
  //       className: DEFAULT_CLASSNAMES.noDataRow,
  //     }),
  //     ...props.childComponents?.noDataRow,
  //   },
  //   groupCell: {
  //     elementAttributes: () => ({
  //       className: DEFAULT_CLASSNAMES.groupCell,
  //     }),
  //     ...props.childComponents?.groupCell,
  //   },
  //   groupRow: {
  //     content: (props) => <GroupRow {...props} sticky={isFirstColumnSticky} />,
  //     ...props.childComponents?.groupRow,
  //   },
  //   paging: {
  //     elementAttributes: () => ({
  //       className: DEFAULT_CLASSNAMES.paging,
  //     }),
  //     content: (pagingProps) => (
  //       <Paging {...pagingProps} isLoading={isLoading} totalRows={paging.totalItems} />
  //     ),
  //     ...props.childComponents?.paging,
  //   },
  // };

  return <Table {...tableProps} dispatch={dispatch} />;
};

export default SimpleTable;
