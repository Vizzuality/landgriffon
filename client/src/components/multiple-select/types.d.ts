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

type MultipleSelectFilterProps = {
  loading?: MultipleSelectProps['loading'];
  error?: MultipleSelectProps['error'];
  maxBadges?: MultipleSelectProps['maxBadges'];
  current: MultipleSelectProps['current'];
  onChange?: MultipleSelectProps['onChange'];
  theme?: 'default' | 'inline-primary';
  placeholder?: MultipleSelectProps['placeholder'];
  showSearch?: MultipleSelectProps['showSearch'];
  options?: MultipleSelectProps['options'];
  ellipsis?: MultipleSelectProps['ellipsis'];
  fitContent?: MultipleSelectProps['fitContent'];
  searchPlaceholder?: MultipleSelectProps['searchPlaceholder'];
  onSearch?: MultipleSelectProps['onSearch'];
};
