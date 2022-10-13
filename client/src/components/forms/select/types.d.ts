export type Option = {
  label: string;
  value: string | number;
};

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  defaultValue?: Option;
  error?: string;
  options: Option[];
  showHint?: boolean;
};
