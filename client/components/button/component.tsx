import {
  ButtonHTMLAttributes, AnchorHTMLAttributes, FC,
} from 'react';
import Link from 'next/link';
import cx from 'classnames';

const THEME = {
  primary: 'text-black bg-blue-500 hover:bg-blue-400 active:bg-blue-300 border border-blue-500 hover:border-blue-400 active:border-blue-300',
  'primary-alt': 'text-blue-500 bg-transparent hover:bg-transparent active:bg-transparent border border-blue-500 hover:border-blue-400 active:border-blue-300',

  secondary: 'text-white bg-gray-500 hover:bg-gray-400 active:bg-gray-300 border border-gray-500 hover:border-gray-400 active:border-gray-300',
  'secondary-alt': 'text-gray-300 bg-transparent hover:bg-transparent active:bg-transparent border border-gray-400 hover:border-gray-300 active:border-gray-200',

  white: 'text-gray-700 bg-white hover:text-white hover:bg-transparent active:bg-transparent border border-gray-400 hover:border-gray-300 active:border-gray-200',

  danger: 'text-red-700 bg-transparent hover:text-white hover:bg-red-700 active:bg-red-600 border border-red-700 hover:border-red-600 active:border-red-500',
};

const SIZE = {
  xs: 'text-sm px-2 py-0.5',
  s: 'text-sm px-3 py-0.5',
  base: 'text-sm px-8 py-2',
  l: 'text-base px-8 py-3',
  xl: 'text-base px-14 py-3',
};

export interface AnchorButtonProps {
  theme: 'primary' | 'primary-alt' | 'white' | 'secondary' | 'secondary-alt' | 'danger';
  size: 'xs' | 's' | 'base' | 'l' | 'xl';
  className?: string;
}

// Button props
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & AnchorButtonProps & {
  href?: undefined;
};

// Anchor props
export type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & AnchorButtonProps & {
  href?: string;
  disabled?: boolean;
};

// Input/output options
type Overload = {
  (props: ButtonProps): JSX.Element;
  (props: AnchorProps): JSX.Element;
};

// Guard to check if href exists in props
const hasHref = (props: ButtonProps | AnchorProps): props is AnchorProps => 'href' in props;

function buildClassName({
  className,
  disabled,
  size,
  theme,
}) {
  return cx({
    'flex items-center justify-center rounded-3xl': true,
    [THEME[theme]]: true,
    [SIZE[size]]: true,
    [className]: !!className,
    'opacity-50 pointer-events-none': disabled,
  });
}

export const LinkAnchor: FC<AnchorProps> = ({
  children,
  theme = 'primary',
  size = 'base',
  className,
  disabled,
  href,
  ...restProps
}: AnchorProps) => (
  <Link href={href}>
    <a
      className={buildClassName({
        className, disabled, size, theme,
      })}
      {...restProps}
    >
      {children}
    </a>
  </Link>
);

export const Anchor: FC<AnchorProps> = ({
  children,
  theme = 'primary',
  size = 'base',
  className,
  disabled,
  href,
  ...restProps
}: AnchorProps) => {
  // Anchor element doesn't support disabled attribute
  // https://www.w3.org/TR/2014/REC-html5-20141028/disabled-elements.html
  if (disabled) {
    return (
      <span {...restProps}>{children}</span>
    );
  }
  return (
    <a
      href={href}
      className={buildClassName({
        className, disabled, size, theme,
      })}
      {...restProps}
    >
      {children}
    </a>
  );
};

export const Button: FC<ButtonProps> = ({
  children,
  theme = 'primary',
  size = 'base',
  className,
  disabled,
  ...restProps
}: ButtonProps) => (
  <button
    type="button"
    className={buildClassName({
      className, disabled, size, theme,
    })}
    disabled={disabled}
    {...restProps}
  >
    {children}
  </button>
);

export const LinkButton: Overload = (props: ButtonProps | AnchorProps) => {
  // We consider a link button when href attribute exits
  if (hasHref(props)) {
    if (props.href.startsWith('http')) {
      return (
        <Anchor {...props} />
      );
    }
    return (
      <LinkAnchor {...props} />
    );
  }
  return (
    <Button {...props} />
  );
};

export default LinkButton;
