import type { GroupBase, Props } from 'react-select';

export type SelectOption<T = string> = {
  label: string;
  value: T;
  extraInfo?: string;
  disabled?: boolean;
};

type Styles = Readonly<{
  border: boolean;
}>;

export interface SelectProps<OptionValue = string, IsMulti extends boolean = false>
  extends Omit<
    Props<SelectOption<OptionValue>, IsMulti, GroupBase<SelectOption<OptionValue>>>,
    'options'
  > {
  instanceId?: number | string;
  showSearch?: boolean;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  options: OptionsOrGroups<SelectOption<OptionValue>, GroupBase<SelectOption<OptionValue>>>;
  defaultValue?: SelectOption<OptionValue>;
  current?: SelectOption<OptionValue> | null;
  placeholder?: string;
  allowEmpty?: boolean;
  onChange?: (selected: SelectOption<OptionValue>) => unknown;
  onSearch?: (query: string) => unknown;
  theme?: 'default' | 'default-bordernone' | 'inline-primary';
  error?: boolean;
  hideValueWhenMenuOpen?: boolean;
  numeric?: boolean;
}
