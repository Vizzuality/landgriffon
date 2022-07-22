import type { IGroupRowProps } from 'ka-table/props';

export type GroupRowProps = IGroupRowProps & {
  /** Whether the row should be sticky (when scrolling horizontally) */
  sticky: boolean;
};
