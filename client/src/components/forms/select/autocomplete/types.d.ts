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
  placeholder?: string | undefined;
  loading?: boolean;
  options: Option<T>[];
  showHint?: boolean;
  onChange: (value: Option<T>) => void;
  rowHeight?: number;
  clearable?: boolean;
  theme?: 'light' | 'dark';
  onClearSelection?: () => void;
  onSearch?: (value: string) => void;
};
