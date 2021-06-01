import cx from 'classnames';
import { forwardRef } from 'react';

const THEME = {
  dark: 'block font-heading font-medium text-xs text-white',
  light: 'block font-heading font-medium text-xs text-gray-600',
};

export interface LabelProps {
  htmlFor?: string;
  theme?: 'dark' | 'light';
  children: React.ReactNode;
  className?: string;
}

const LabelComponent = (
  {
    htmlFor, theme = 'dark', children, className,
  }: LabelProps,
  ref,
) => (
  <label
    className={cx({
      [THEME[theme]]: true,
      [className]: !!className,
    })}
    htmlFor={htmlFor}
    ref={ref}
  >
    {children}
  </label>
);

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  LabelComponent,
);

export default Label;
