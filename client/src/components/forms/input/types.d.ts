export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactElement<SVGElement | HTMLDivElement>;
  unit?: string;
  error?: string | boolean;
  showHint?: boolean;
};
