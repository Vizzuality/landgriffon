export type Option<T = string> = {
  label: string;
  value: T;
  disabled?: boolean;
};

type SelectValue<M> = M extends true ? Option<T>[] : Option<T>;

export type SelectProps<T = string> = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'className' | 'onChange' | 'value' | 'defaultValue'
> & {
  defaultValue?: Option<T>;
  value?: Option<T>[] | Option<T>;
  error?: string;
  icon?: React.ReactElement<SVGElement | HTMLDivElement>;
  label?: React.ReactNode;
  placeholder?: string | undefined;
  loading?: boolean;
  options: Option<T>[];
  showHint?: boolean;
  multiple?: boolean;
  theme?: 'light' | 'dark';
  onChange: (value: Option<T> | Option<T>[]) => void;
};
