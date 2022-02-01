import { ISummaryCellProps, ICellProps } from 'ka-table/props';
import { ITableProps } from 'ka-table';
import { GroupRowData } from 'ka-table/models';

export type ITableData = ITableProps & {
  key?: string;
  yearsSum: Record<number, string>;
};

export type CustomSummaryCell = ISummaryCellProps & {
  yearsSum: Record<number, string>;
};

export type CustomColumn = ICellProps & {
  chart: boolean;
  width: number;
};

export type CustomChartCell = ICellProps & {
  column: CustomColumn;
  rowData: GroupRowData;
};

export type CustomSummaryCellSingleIndicator = ISummaryCellProps & {
  yearSum: {
    year: number;
    value: number;
  }[];
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
  column: { chart: boolean; width: number };
  rowData: GroupRowData;
};
