export type Option = {
  label: string;
  value: string | number;
};

export type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'className' | 'onChange' | 'value' | 'defaultValue'
> & {
  defaultValue?: Option;
  value?: Option;
  error?: string;
  label?: React.ReactNode;
  options: Option[];
  showHint?: boolean;
  onChange: (value: Option) => void;
};
