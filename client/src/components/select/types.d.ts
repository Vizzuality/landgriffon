export type SelectOption<T = string> = {
  label: string;
  value: T;
  extraInfo?: string;
  disabled?: boolean;
};

export type SelectOptions<T = string> = SelectOption<T>[];

type Styles = Readonly<{
  border: boolean;
}>;

export type SelectProps<T> = {
  instanceId?: number | string;
  showSearch?: boolean;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  options: SelectOption<T>[];
  defaultValue?: SelectOption<T>;
  current?: SelectOption<T> | null;
  placeholder?: string;
  allowEmpty?: boolean;
  onChange?: (selected: SelectOption<T>) => unknown;
  onSearch?: (query: string) => unknown;
  theme?: 'default' | 'default-bordernone' | 'inline-primary';
  error?: boolean;
  hideValueWhenMenuOpen?: boolean;
  numeric?: boolean;
};
