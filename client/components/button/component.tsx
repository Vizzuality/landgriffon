import { ButtonHTMLAttributes, AnchorHTMLAttributes, FC } from 'react';
import Link from 'next/link';
import cx from 'classnames';

const COMMON_CLASSNAMES =
  'inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';

const THEME = {
  primary: 'border-transparent shadow-sm text-white bg-indigo-600 hover:bg-indigo-700',
  secondary: 'border-gray-300 shadow-sm text-gray-700 bg-white hover:bg-gray-50',
};

const SIZE = {
  xs: 'text-xs px-2.5 py-1.5',
  base: 'text-sm px-4 py-2',
  xl: 'text-base px-6 py-3',
};

export interface AnchorButtonProps {
  children: React.ReactNode;
  theme?: 'primary' | 'secondary';
  size?: 'xs' | 'base' | 'xl';
  className?: string | any;
}

// Button props
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  AnchorButtonProps & {
    href?: undefined;
  };

// Anchor props
export type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  AnchorButtonProps & {
    href?: string;
    disabled?: boolean;
    shallow?: boolean;
  };

// Input/output options
type Overload = {
  (props: ButtonProps): JSX.Element;
  (props: AnchorProps): JSX.Element;
};

// Guard to check if href exists in props
const hasHref = (props: ButtonProps | AnchorProps): props is AnchorProps => 'href' in props;

function buildClassName({ className, disabled, size = 'base', theme = 'primary' }: AnchorProps) {
  return cx(COMMON_CLASSNAMES, THEME[theme], SIZE[size], {
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
  shallow,
  ...restProps
}: AnchorProps) => (
  <Link href={href as string} shallow={shallow}>
    <a
      className={buildClassName({
        className,
        disabled,
        size,
        theme,
      } as AnchorProps)}
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
    return <span {...restProps}>{children}</span>;
  }
  return (
    <a
      href={href}
      className={buildClassName({
        className,
        disabled,
        size,
        theme,
      } as AnchorProps)}
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
      className,
      disabled,
      size,
      theme,
    } as AnchorProps)}
    disabled={disabled}
    {...restProps}
  >
    {children}
  </button>
);

export const LinkButton: Overload = (props: ButtonProps | AnchorProps) => {
  // We consider a link button when href attribute exits
  if (hasHref(props)) {
    if (props.href?.startsWith('http')) {
      return <Anchor {...props} />;
    }
    return <LinkAnchor {...props} />;
  }
  return <Button {...props} />;
};

export default LinkButton;
