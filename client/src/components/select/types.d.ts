export type SelectOption = {
  label: string;
  value: string | number;
};

export type SelectOptions = SelectOption[];

export type SelectProps = {
  label?: string;
  options: SelectOption[];
  current: SelectOption;
  onChange?: (selected: SelectOption) => unknown;
};
