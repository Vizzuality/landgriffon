import { useCallback, useState } from 'react';
import cx from 'classnames';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/outline';
import { updateTreeGroupsExpanded } from 'ka-table/actionCreators';
import { getEditableCell } from 'ka-table/Utils/CellUtils';
import { getField } from 'ka-table/Utils/ColumnUtils';
import { getValueByColumn } from 'ka-table/Utils/DataUtils';

import Cell from 'components/table/cell';

import type { DataRowProps } from './types';

const DataRow: React.FC<DataRowProps> = ({
  childComponents,
  columns,
  treeDeep,
  dispatch,
  editingMode,
  format,
  isDetailsRowShown,
  isSelectedRow,
  isTreeExpanded,
  isTreeGroup,
  rowData,
  rowEditableCells,
  rowKeyField,
  rowKeyValue,
  selectedRows,
  validation,
  firstColumnKey,
  isFirstColumnSticky,
}) => {
  const [isRowHovered, setIsRowHovered] = useState<boolean>(false);

  const arrow = isTreeGroup ? (
    isTreeExpanded ? (
      <ChevronDownIcon key={rowKeyValue} className="shrink-0 mt-0.5 mr-2 w-4 h-4 text-gray-900" />
    ) : (
      <ChevronRightIcon key={rowKeyValue} className="shrink-0 mt-0.5 mr-2 w-4 h-4 text-gray-900" />
    )
  ) : undefined;

  const handleClick = useCallback(() => {
    if (!isTreeGroup) return;
    dispatch(updateTreeGroupsExpanded(rowKeyValue));
  }, [dispatch, isTreeGroup, rowKeyValue]);

  return (
    <>
      {columns.map((column, index) => {
        const editableCell = getEditableCell(column, rowEditableCells);
        const hasEditorValue = editableCell && editableCell.hasOwnProperty('editorValue');
        const editorValue = editableCell && editableCell.editorValue;
        const value = hasEditorValue ? editorValue : getValueByColumn(rowData, column);

        const cellDeep = treeDeep != null && index === 0 ? treeDeep : undefined;
        return (
          <Cell
            className={cx({
              'cursor-pointer': isTreeGroup,
              'font-semibold': isTreeExpanded && treeDeep === 0 && index === 0,
              'border-l border-dashed border-gray-200': column.isFirstYearProjected,
            })}
            treeArrowElement={index === 0 && arrow}
            childComponents={childComponents}
            treeDeep={cellDeep}
            column={column}
            dispatch={dispatch}
            editingMode={editingMode}
            editorValue={editorValue}
            field={getField(column)}
            format={format}
            hasEditorValue={editableCell && editableCell.hasOwnProperty('editorValue')}
            isDetailsRowShown={isDetailsRowShown}
            isEditableCell={!!editableCell}
            isSelectedRow={isSelectedRow}
            key={`${rowKeyValue}-${column.key}-${index}`}
            rowData={rowData}
            rowKeyField={rowKeyField}
            rowKeyValue={rowKeyValue}
            selectedRows={selectedRows}
            validation={validation}
            validationMessage={editableCell && editableCell.validationMessage}
            value={value}
            firstColumnKey={firstColumnKey}
            isFirstColumnSticky={isFirstColumnSticky}
            onClick={handleClick}
            onMouseEnter={() => setIsRowHovered(true)}
            onMouseLeave={() => setIsRowHovered(false)}
            isRowHovered={isRowHovered}
          />
        );
      })}
    </>
  );
};

export default DataRow;
