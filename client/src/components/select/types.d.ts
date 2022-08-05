export type SelectOption = {
  label: string;
  value: string | number;
  extraInfo?: string;
  disabled?: boolean;
};

export type SelectOptions = SelectOption[];

type Styles = Readonly<{
  border: boolean;
}>;

export type SelectProps = {
  instanceId?: number | string;
  showSearch?: boolean;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  options: SelectOption[];
  defaultValue?: SelectOption;
  current?: SelectOption | null;
  placeholder?: string;
  allowEmpty?: boolean;
  onChange?: (selected: SelectOption) => unknown;
  onSearch?: (query: string) => unknown;
  theme?: 'default' | 'default-bordernone' | 'inline-primary';
  error?: boolean;
  hideValueWhenMenuOpen?: boolean;
  numeric?: boolean;
};
