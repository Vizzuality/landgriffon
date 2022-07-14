import { InputHTMLAttributes } from 'react';

// react types
export type SearchProps = InputHTMLAttributes & {
  icon?: (props: React.ComponentProps<'svg'>) => JSX.Element;
};
