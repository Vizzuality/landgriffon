export type TreeSelectOption = {
  label: string;
  value: string | number;
  children?: TreeSelectOption[];
};

export type TreeSelectOptions = TreeSelectOption[];

export type TreeSelectProps = {
  maxBadges?: number;
  placeholder?: string;
  showSearch?: boolean;
  multiple?: boolean;
  loading?: boolean;
  options: TreeSelectOptions;
  current: TreeSelectOptions;
  onChange?: (selected: SelectOption) => unknown;
  onSearch?: (query: string) => unknown;
  theme?: 'default' | 'inline-primary';
  ellipsis?: boolean;
  error?: boolean;
  fitContent?: boolean;
  label?: string;
  /**
   * ALL: show all ids in the values (default by tree-select component)
   * PARENT: if parent is selected and also all children are selected, only parent id is in the values
   * CHILD: if parent is selected and also all children are selected, only children ids are in the values
   * ONLY_CHILD: only for styling purpose, only children ids are in the values and just the first child is shown
   */
  checkedStrategy?: 'ALL' | 'PARENT' | 'CHILD';
  checkedStrategyDisplay?: 'ONLY_CHILD';
};
