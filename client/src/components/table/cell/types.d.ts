import type { ICellProps } from 'ka-table/props';
import type { Column } from '../types';

export type CellProps = Omit<ICellProps, 'column'> & {
  /** Classnames to apply to the container */
  className?: string;
  /** Key of the first column in the table */
  firstColumnKey: string;
  /** Whether the first column should be sticky (when scrolling horizontally) */
  isFirstColumnSticky: boolean;
  /** Whether the row is being hovered. Defaults to `false` */
  isRowHovered?: boolean;
  /** onclick callback */
  onClick?: () => void;
  /** onmouseenter callback */
  onMouseEnter?: () => void;
  /** onmouseleave callback */
  onMouseLeave?: () => void;
  column: Column;
};
