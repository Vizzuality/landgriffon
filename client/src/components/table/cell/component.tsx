import { useCallback, useMemo } from 'react';
import cx from 'classnames';

import CellEditor from 'ka-table/Components/CellEditor/CellEditor';
import CellElement from 'ka-table/Components/CellComponent/CellComponent';

import LineChartCell from 'components/table/cell/line-chart-cell';
import { DEFAULT_CLASSNAMES, SHADOW_CLASSNAMES } from 'components/table/constants';

import type { CellProps } from './types';
import { DataType } from '../enums';
import type { ICellEditorProps, ICellProps } from 'ka-table/props';

const Cell: React.FC<CellProps> = (props) => {
  const {
    className,
    column,
    treeDeep,
    treeArrowElement,
    isEditableCell,
    firstColumnKey,
    isFirstColumnSticky,
    isRowHovered = false,
    onClick,
    onMouseEnter,
    onMouseLeave,
    rowKeyValue,
  } = props;

  const isSticky = isFirstColumnSticky && props.column.key === firstColumnKey;
  const isFirstColumn = props.column.key === firstColumnKey;

  const cellSpacingElements = useMemo(
    () => () => {
      const numSpaces = treeDeep ? treeDeep - (treeArrowElement ? 0 : 1) : 0;
      return [...Array(numSpaces)].map((value, index) => (
        <div key={`${rowKeyValue}-${props.column.key}-cell-spacing-${index}`} className="w-5" />
      ));
    },
    [props.column.key, rowKeyValue, treeArrowElement, treeDeep],
  );

  const cellElement = useMemo(() => {
    if (isEditableCell) return <CellEditor {...(props as ICellEditorProps)} />;

    switch (column.dataType) {
      case DataType.LineChart:
        return <LineChartCell {...props} />;
      case DataType.Object:
        return <CellElement {...(props as ICellProps)} />;
      default:
        return <CellElement {...(props as ICellProps)} />;
    }
  }, [column.dataType, isEditableCell, props]);

  const handleClick = useCallback(() => {
    onClick && onClick();
  }, [onClick]);

  return (
    <td
      className={cx(DEFAULT_CLASSNAMES.cell, {
        'sticky left-0 z-10 w-80': isSticky,
        [SHADOW_CLASSNAMES]: isSticky,
      })}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={cx(
          'w-full flex py-3 px-4 items-center break-all transition-colors duration-200 h-full',
          {
            'justify-center': !isFirstColumn,
            'bg-green-50': isRowHovered,
            [className]: !!className,
          },
        )}
      >
        <div className="flex items-start">
          {cellSpacingElements()}
          {treeArrowElement}
          {cellElement}
        </div>
      </div>
    </td>
  );
};

export default Cell;
