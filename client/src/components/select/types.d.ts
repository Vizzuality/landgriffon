export type SelectOption = {
  label: string;
  value: string | number;
};

export type SelectOptions = SelectOption[];

export type SelectProps = {
  showSearch?: boolean;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  options: SelectOption[];
  current: SelectOption;
  placeholder?: string;
  searchPlaceholder?: string;
  onChange?: (selected: SelectOption) => unknown;
  onSearch?: (query: string) => unknown;
};
