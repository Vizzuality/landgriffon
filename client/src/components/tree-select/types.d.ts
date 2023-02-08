import type { FieldDataNode } from 'rc-tree';
import type { CHECKED_STRATEGIES } from './utils';

export type TreeSelectOption<T = string> = {
  label: string;
  value: T;
  children?: TreeSelectOption[];
};

interface CommonTreeProps<T = string> {
  id?: string; // for testing purposes
  maxBadges?: number;
  placeholder?: string;
  showSearch?: boolean;
  loading?: boolean;
  options: TreeSelectOption<T>[];
  onSearch?: (query: string) => unknown;
  theme?: 'default' | 'inline-primary';
  ellipsis?: boolean;
  error?: boolean;
  fitContent?: boolean;
  label?: string;
  error?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  /**
   * - `ALL`: show all ids in the values (default by tree-select component)
   * - `PARENT`: if parent is selected and also all children are selected, only parent id is in the values
   * - `CHILD`: if parent is selected and also all children are selected, only children ids are in the values
   * - `ONLY_CHILD`: only for styling purpose, only children ids are in the values and just the first child is shown
   */
  checkedStrategy?: keyof typeof CHECKED_STRATEGIES;
  checkedStrategyDisplay?: 'ONLY_CHILD';
}

export interface TreeSelectProps<IsMulti extends boolean = false> extends CommonTreeProps {
  multiple?: readonly IsMulti;
  current: (IsMulti extends true ? TreeSelectOption[] : TreeSelectOption) | null;
  onChange?: (selected: IsMulti extends true ? TreeSelectOption[] : TreeSelectOption) => void;
}

export type TreeDataNode = FieldDataNode<Omit<TreeSelectOption<T>, 'children'>>;
