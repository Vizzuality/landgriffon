export type TreeSelectOption = {
  label: string;
  value: string | number;
  children?: TreeSelectOption[];
};

interface CommonTreeProps {
  maxBadges?: number;
  placeholder?: string;
  showSearch?: boolean;
  loading?: boolean;
  options: TreeSelectOption[];
  onSearch?: (query: string) => unknown;
  theme?: 'default' | 'inline-primary';
  ellipsis?: boolean;
  error?: boolean;
  fitContent?: boolean;
  label?: string;
  error?: boolean;
  autoFocus?: boolean;
  /**
   * - `ALL`: show all ids in the values (default by tree-select component)
   * - `PARENT`: if parent is selected and also all children are selected, only parent id is in the values
   * - `CHILD`: if parent is selected and also all children are selected, only children ids are in the values
   * - `ONLY_CHILD`: only for styling purpose, only children ids are in the values and just the first child is shown
   */
  checkedStrategy?: 'ALL' | 'PARENT' | 'CHILD';
  checkedStrategyDisplay?: 'ONLY_CHILD';

  // multiple: Multi;
  // current: Multi extends true ? TreeSelectOption[] : TreeSelectOption;
  // onChange?: (selected: Multi extends true ? TreeSelectOption[] : TreeSelectOption) => void;
}

// interface MultipleTreeProps {
//   multiple: true;
//   current: TreeSelectOption[];
//   onChange?: (selected: TreeSelectOption[]) => void;
// }

// interface SingleTreeProps {
//   multiple?: false;
//   current: TreeSelectOption;
//   onChange?: (selected: TreeSelectOption) => void;
// }

// interface TreeSelectPropsWithoutMultiple<IsMulti extends boolean> extends CommonTreeProps {
//   current: IsMulti extends true ? TreeSelectOption[] : TreeSelectOption;
//   onChange?: (selected: IsMulti extends true ? TreeSelectOption[] : TreeSelectOption) => void;
// }

export interface TreeSelectProps<IsMulti extends boolean = false> extends CommonTreeProps {
  multiple?: IsMulti;
  current: IsMulti extends true ? TreeSelectOption[] : TreeSelectOption | null;
  onChange?: (selected: IsMulti extends true ? TreeSelectOption[] : TreeSelectOption) => void;
}
