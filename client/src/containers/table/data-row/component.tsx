import { useState } from 'react';

import cx from 'classnames';

import { updateTreeGroupsExpanded } from 'ka-table/actionCreators';
import defaultOptions from 'ka-table/defaultOptions';
import { getEditableCell } from 'ka-table/Utils/CellUtils';
import { getField } from 'ka-table/Utils/ColumnUtils';
import { getValueByColumn } from 'ka-table/Utils/DataUtils';

import Cell from 'containers/table/cell';

import { DataRowProps } from './types';

const DataRow: React.FC<DataRowProps> = ({
  childComponents,
  columns,
  groupColumnsCount,
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
}: DataRowProps) => {
  const [isRowHovered, setIsRowHovered] = useState<boolean>(false);

  const arrow = isTreeGroup
    ? [
        <div
          key={0}
          onClick={() => dispatch(updateTreeGroupsExpanded(rowKeyValue))}
          className={
            isTreeExpanded
              ? defaultOptions.css.iconTreeArrowExpanded
              : defaultOptions.css.iconTreeArrowCollapsed
          }
        />,
      ]
    : undefined;

  const handleClick = () => {
    if (!isTreeGroup) return;
    dispatch(updateTreeGroupsExpanded(rowKeyValue));
  };

  return (
    <>
      {[...Array(groupColumnsCount)].map((index) => (
        <td key={index} className="ka-empty-cell"></td>
      ))}
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
            })}
            treeArrowElement={arrow?.pop()}
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
            key={column.key}
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
