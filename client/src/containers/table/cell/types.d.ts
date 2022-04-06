export type CellProps = ICellProps & {
  className?: string;
  firstColumnKey?: string;
  isFirstColumnSticky?: boolean;
  stickyColumnKey?: string;
  isFirstColumn?: boolean;
  isRowHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};
