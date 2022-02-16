export type SelectOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

export type SelectOptions = SelectOption[];

type Styles = Readonly<{
  border: boolean;
}>;

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
  theme?: 'primary' | 'primary_bordernone' | 'secondary';
};
