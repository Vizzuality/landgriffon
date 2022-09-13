import cx from 'classnames';
import { forwardRef } from 'react';
import Loading from 'components/loading';
import classNames from 'classnames';

const COMMON_CLASSNAMES =
  'shadow-sm inline-flex items-center overflow-hidden justify-center rounded-md cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:hover:bg-green-700';

const PRIMARY =
  'shadow-sm border-transparent text-white bg-primary hover:bg-green-800 focus:outline-offset-2 focus:outline focus:outline-green-600';

const BASE_BORDER =
  'border bg-transparent focus:outline-offset-2 focus:outline focus:outline-none focus:ring-1';

const SECONDARY = classNames(
  BASE_BORDER,
  'border border-gray-300 focus:border-primary text-gray-700 hover:bg-gray-50 focus:ring-green-700',
);

const TERTIARY =
  'border-transparent shadow-sm text-white bg-gray-500 hover:bg-gray-700 focus:outline-offset-2 focus:outline focus:outline-gray-500/20';

const PRIMARY_LIGHT = classNames(BASE_BORDER, 'text-primary border-primary');

export const THEME = {
  default: COMMON_CLASSNAMES,
  primary: PRIMARY,
  secondary: SECONDARY,
  tertiary: TERTIARY,
  textLight: '!shadow-none bg-transparent text-gray-500 focus:outline-none focus:text-black',
  primaryLight: PRIMARY_LIGHT,
} as const;

const SIZE = {
  xs: 'font-medium text-xs px-2.5 py-1.5',
  base: 'font-medium text-sm px-4 py-2 h-10',
  xl: 'font-medium text-base px-6 py-3',
  text: 'font-normal text-sm p-0',
};

export type AnchorButtonProps = {
  theme?: keyof typeof THEME;
  size?: 'xs' | 'base' | 'xl' | 'text';
  loading?: boolean;
  icon?: React.ReactNode;
};

// Button props
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & AnchorButtonProps;

// Anchor props
export type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  AnchorButtonProps & {
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
  size = 'base',
  theme = 'primary',
  loading = false,
}: AnchorProps) {
  return cx(COMMON_CLASSNAMES, THEME[theme], SIZE[size], className, {
    'pointer-events-none hover:bg-green-700': loading,
  });
}

export const Anchor: React.FC<AnchorProps> = ({
  children,
  theme = 'primary',
  size = 'base',
  className,
  disabled,
  href,
  icon,
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
      {icon && <span className="inline-block mr-2">{icon}</span>}
      {children}
    </a>
  );
};

// Same as Anchor but it could be used inside <Link> elements
export const AnchorLink = forwardRef<HTMLAnchorElement, AnchorProps>(
  (
    {
      children,
      theme = 'primary',
      size = 'base',
      className,
      disabled,
      href,
      icon,
      ...restProps
    }: AnchorProps,
    ref,
  ) => {
    // Anchor element doesn't support disabled attribute
    // https://www.w3.org/TR/2014/REC-html5-20141028/disabled-elements.html
    if (disabled) {
      return (
        <span {...restProps} ref={ref}>
          {icon && <span className="inline-block mr-2">{icon}</span>}
          {children}
        </span>
      );
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
        ref={ref}
      >
        {icon && <span className="inline-block mr-2">{icon}</span>}
        {children}
      </a>
    );
  },
);

AnchorLink.displayName = 'AnchorLink';

export const Button: React.FC<ButtonProps> = ({
  children,
  theme = 'primary',
  size = 'base',
  className,
  disabled,
  loading = false,
  icon,
  ...restProps
}) => (
  <button
    type="button"
    className={buildClassName({
      className,
      size,
      theme,
      loading,
    } as AnchorProps)}
    disabled={loading || disabled}
    {...restProps}
  >
    {icon && <span className="inline-block mr-2">{icon}</span>}
    {loading ? <Loading className="text-white" /> : children}
  </button>
);

export const LinkButton: Overload = (props: AnchorProps | ButtonProps) => {
  // We consider a link button when href attribute exits
  if (hasHref(props)) {
    return <Anchor {...props} />;
  }
  return <Button {...props} />;
};

export default LinkButton;
