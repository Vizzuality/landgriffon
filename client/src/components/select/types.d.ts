export type SelectOption = {
  label: string;
  value: string | number;
};

export type SelectOptions = SelectOption[];

export type SelectProps = {
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  options: SelectOption[];
  current: SelectOption;
  onChange?: (selected: SelectOption) => unknown;
};
