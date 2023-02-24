import type { Option } from '../types';

export type AutoCompleteSelectProps<T = string> = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'className' | 'onChange' | 'value' | 'defaultValue'
> & {
  defaultValue?: Option<T>;
  value?: Option<T>;
  error?: string;
  icon?: React.ReactElement<SVGElement | HTMLDivElement>;
  label?: React.ReactNode;
  loading?: boolean;
  options: Option<T>[];
  showHint?: boolean;
  onChange: (value: Option<T>) => void;
  rowHeight?: number;
  clearable?: boolean;
  onClearSelection?: () => void;
};
