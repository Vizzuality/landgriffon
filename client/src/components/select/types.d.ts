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
    'value' | 'isSearchable' | 'label' | 'placeholder' | 'isClearable' | 'isLoading' | 'isDisabled'
  > {
  instanceId?: number | string;
  showSearch?: boolean;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  current?: Props<
    SelectOption<OptionValue>,
    IsMulti,
    GroupBase<SelectOption<OptionValue>>
  >['value'];
  allowEmpty?: boolean;
  placeholder?: string;
  allowEmpty?: boolean;
  onChange?: (selected: SelectOption<OptionValue>) => unknown;
  onSearch?: (query: string) => unknown;
  theme?: 'default' | 'default-bordernone' | 'inline-primary';
  error?: boolean;
  hideValueWhenMenuOpen?: boolean;
  numeric?: boolean;
}
