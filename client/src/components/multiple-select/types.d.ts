export type MultipleSelectOption = {
  label: string;
  value: string | number;
};

export type MultipleSelectOptions = MultipleSelectOption[];

export type MultipleSelectProps = {
  maxBadges?: number;
  placeholder?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  multiple?: boolean;
  loading?: boolean;
  options: MultipleSelectOptions;
  current: MultipleSelectOptions;
  onSelect?: (selected: SelectOption) => unknown;
  onChange?: (selected: SelectOption) => unknown;
  onSearch?: (query: string) => unknown;
  theme?: 'default' | 'inline-primary';
  ellipsis?: boolean;
  error?: boolean;
  fitContent?: boolean;
};
