import cx from 'classnames';
import React, { forwardRef } from 'react';
import Loading from 'components/loading';
import classNames from 'classnames';

const classes = {
  base: 'inline-flex items-center min-w-content focus:outline-none focus:ring-2 focus:ring-offset-1',
  disabled: 'pointer-events-none',
  size: {
    xs: 'rounded leading-4 py-2 px-3 text-xs',
    base: 'rounded-md leading-5 py-2.5 px-4 text-sm',
    xl: 'rounded-md leading-5 py-3 px-6 text-sm',
  },
  variant: {
    primary: {
      default: 'bg-navy-400 text-white hover:shadow-md hover:bg-navy-600 focus:ring-navy-400/20',
      danger: 'bg-red-400 text-white hover:shadow-md hover:bg-red-800 focus:ring-red-400/20',
      disabled: 'opacity-50',
    },
    secondary: {
      default:
        'text-navy-400 bg-transparent border border-navy-400 hover:shadow-md hover:bg-white focus:ring-navy-400/20',
      danger:
        'text-red-400 bg-transparent border border-red-400 hover:shadow-md hover:bg-white focus:ring-red-400/20',
      disabled: 'opacity-50',
    },
    white: {
      default:
        'bg-white text-gray-500 border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-100 focus:ring-navy-400/20',
      danger:
        'bg-white text-red-400 border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-100 focus:ring-red-400/20',
      disabled: 'opacity-50',
    },
  },
};

const COMMON_CLASSNAMES =
  'shadow-sm inline-flex items-center overflow-hidden justify-center rounded-md cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:hover:bg-green-700';

const PRIMARY =
  'shadow-sm border-transparent text-white bg-primary hover:bg-green-800 focus:outline-offset-2 focus:outline focus:outline-green-600';

const BASE_BORDER =
  'border bg-transparent focus:outline-offset-2 focus:outline focus:outline-none focus:ring-1';

const SECONDARY = classNames(
  BASE_BORDER,
  'border border-gray-300 focus:border-primary text-gray-600 hover:bg-gray-50 focus:ring-green-700',
);

const TERTIARY =
  'border-transparent shadow-sm text-white bg-gray-500 hover:bg-gray-600 focus:outline-offset-2 focus:outline focus:outline-gray-500/20';

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
  xs: 'font-regular text-xs px-2.5 py-1.5',
  base: 'font-medium text-sm px-4 py-2 h-10',
  xl: 'font-medium text-base px-6 py-3',
  text: 'font-normal text-sm p-0',
};

export type AnchorButtonProps = {
  variant?: keyof typeof classes.variant;
  size?: keyof typeof classes.size;
  loading?: boolean;
  danger?: boolean;
  icon?: React.ReactElement<SVGElement>;
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
  variant = 'primary',
  loading = false,
}: AnchorProps) {
  return cx(COMMON_CLASSNAMES, THEME[variant], SIZE[size], className, {
    'pointer-events-none hover:bg-green-700': loading,
  });
}

export const Anchor: React.FC<AnchorProps> = ({
  children,
  variant = 'primary',
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
        variant,
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
      variant = 'primary',
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
          variant,
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
  variant = 'primary',
  size = 'base',
  className,
  disabled,
  loading = false,
  icon,
  danger = false,
  ...restProps
}) => (
  <button
    type="button"
    className={classNames(
      classes.base,
      danger ? classes.variant[variant].danger : classes.variant[variant].default,
      classes.size[size],
      disabled && classes.disabled,
      disabled && classes.variant[variant].disabled,
      loading && classes.disabled,
    )}
    disabled={loading || disabled}
    {...restProps}
  >
    {!loading && icon && (
      <div className="mr-2">
        {React.cloneElement(
          icon,
          {
            className: classNames(
              {
                'w-3 h-3': size === 'xs',
                'w-4 h-4': size !== 'xs',
                'text-gray-900': variant === 'white',
              },
              icon.props?.className,
            ),
          },
          null,
        )}
      </div>
    )}
    {loading && (
      <Loading
        className={classNames('mr-2', {
          'w-3 h-3': size === 'xs',
          'w-4 h-4': size !== 'xs',
          'text-gray-900': variant === 'white' && !danger,
        })}
      />
    )}
    <div>{children}</div>
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
