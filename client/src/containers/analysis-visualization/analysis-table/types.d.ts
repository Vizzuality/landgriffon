import { ISummaryCellProps, ICellProps } from 'ka-table/props';
import { ITableProps } from 'ka-table';
import { GroupRowData } from 'ka-table/models';
import { CellProps } from 'components/table/cell';

export type ITableData = Omit<ITableProps, 'columns'> & {
  key?: string;
  columns: CellProps['column'][];
};

export type CustomColumn = ICellProps & {
  type: 'analysis-chart';
  width: number;
  isProjected: boolean;
  isFirstYearProjected?: number;
};

export type CustomChartCell = ICellProps & {
  column: CustomColumn;
  rowData: GroupRowData;
};

export type CustomSummaryCellSingleIndicator = ISummaryCellProps & {
  rowData: unknown;
  columns: ColumnHeadings[];
  width: number;
};

export type ColumnHeadings = Readonly<{
  dataType: DataType.String | DataType.Number;
  key: string;
  title: string;
  width?: number;
  chart?: boolean;
}>;

export type CustomChartCell = ICellProps & {
  column: { chart: boolean; width: number; isProjected: boolean; isFirstYearProjected: boolean };
  rowData: GroupRowData;
};
