import type { TreeProps } from 'rc-tree';

export type TreeSelectOption = {
  label: string;
  value: string | number;
};

export type TreeSelectOptions = SelectOption[];

export type TreeSelectProps = {
  data: TreeProps['treeData'];
  // showSearch?: boolean;
  // disabled?: boolean;
  // loading?: boolean;
  // label?: string;
  // options: SelectOption[];
  // current: SelectOption;
  // onChange?: (selected: SelectOption) => unknown;
  // onSearch?: (query: string) => unknown;
};
