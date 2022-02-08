import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import { Table as KaTable, kaReducer } from 'ka-table';
import { updateData } from 'ka-table/actionCreators';
import { SortingMode } from 'ka-table/enums';
import { DispatchFunc } from 'ka-table/types';

import GroupRow from 'containers/table/group-row';
import LineChart from 'components/chart/line/component';

import { DEFAULT_CLASSNAMES, CUSTOM_CELL_CLASSNAMES, SHADOW_CLASSNAMES } from './constants';
import { TableProps, ColumnProps } from './types';

const defaultProps: TableProps = {
  columns: [],
  data: [],
  rowKeyField: 'id',
  sortingMode: SortingMode.Single,
};

const Table: React.FC<TableProps> = ({
  classNames,
  stickyFirstColumn: isFirstColumnSticky = true,
  ...props
}: TableProps) => {
  const [tableProps, changeTableProps] = useState({ ...defaultProps, ...props });

  const firstColumnKey = props.columns[0]?.key;
  const stickyColumnKey = isFirstColumnSticky && firstColumnKey;

  const dispatch: DispatchFunc = (action) => {
    changeTableProps((prevState) => kaReducer(prevState, action));
  };

  useEffect(() => {
    dispatch(updateData(props.data));
  }, [props.data]);

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
        const classNames = DEFAULT_CLASSNAMES.headCell;

        return {
          className: cx(classNames, {
            'text-center': !isFirstColumn,
            'sticky left-0 z-10 w-80': isSticky,
            [SHADOW_CLASSNAMES]: isSticky,
          }),
        };
      },
      ...props.childComponents?.headCell,
    },
    headCellContent: {
      elementAttributes: () => ({
        className: DEFAULT_CLASSNAMES.headCellContent,
      }),
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
            const chartConfig = props.rowData.datesRangeChart;
            return (
              <div
                style={{ width: +props.column.width - 20, height: 50 }}
                className={CUSTOM_CELL_CLASSNAMES.lineChart}
              >
                <LineChart chartConfig={chartConfig} />
              </div>
            );
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
      className={cx('relative', classNames, {
        'my-4': !classNames,
      })}
    >
      <KaTable {...tableProps} childComponents={childComponents} dispatch={dispatch} />
    </div>
  );
};

export default Table;
