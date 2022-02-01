import React, { useEffect, useState } from 'react';

import { ITableProps, kaReducer, Table } from 'ka-table';
import { updateData } from 'ka-table/actionCreators';
import { SortingMode } from 'ka-table/enums';
import { DispatchFunc } from 'ka-table/types';
import { ChildComponents } from 'ka-table/Models/ChildComponents';

const defaultTableProps: ITableProps = {
  columns: [],
  data: [],
  rowKeyField: 'id',
  sortingMode: SortingMode.Single,
};

const TableComponent: React.FC<{ tablePropsInit: ITableProps; childComponents?: ChildComponents }> =
  ({ tablePropsInit, childComponents = {} }) => {
    // in this case *props are stored in the state of parent component
    const [tableProps, changeTableProps] = useState({ ...defaultTableProps, ...tablePropsInit });

    // dispatch has an *action as an argument
    const dispatch: DispatchFunc = (action) => {
      // *kaReducer returns new *props according to previous state and *action, and saves new props to the state
      changeTableProps((prevState: ITableProps) => kaReducer(prevState, action));
    };

    useEffect(() => {
      dispatch(updateData(tablePropsInit.data));
    }, [tablePropsInit.data]);

    return (
      <Table
        {...tableProps} // ka-table UI is rendered according to props
        // columns={tableProps.columns.filter((c) => c.visible)}
        dispatch={dispatch} // dispatch is required for obtain new actions from the UI
        childComponents={childComponents}
      />
    );
  };

export default TableComponent;
