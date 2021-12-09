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
};
