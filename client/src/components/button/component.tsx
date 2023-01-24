import React, { forwardRef } from 'react';
import classNames from 'classnames';

import Loading from 'components/loading';

const classes = {
  base: 'inline-flex justify-center items-center min-w-content hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1',
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
        'text-navy-400 bg-transparent border border-navy-400 hover:shadow-md hover:bg-white focus:bg-navy-400 focus:text-white focus:ring-navy-400/20',
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
  'shadow-sm border-transparent text-white bg-navy-400 hover:bg-green-800 focus:outline-offset-2 focus:outline focus:outline-green-600';

const BASE_BORDER =
  'border bg-transparent focus:outline-offset-2 focus:outline focus:outline-none focus:ring-1';

const SECONDARY = classNames(
  BASE_BORDER,
  'border border-gray-300 focus:border-navy-400 text-gray-600 hover:bg-gray-50 focus:ring-green-700',
);

const TERTIARY =
  'border-transparent shadow-sm text-white bg-gray-500 hover:bg-gray-600 focus:outline-offset-2 focus:outline focus:outline-gray-500/20';

const PRIMARY_LIGHT = classNames(BASE_BORDER, 'text-navy-400 border-navy-400');

export const THEME = {
  default: COMMON_CLASSNAMES,
  primary: PRIMARY,
  secondary: SECONDARY,
  tertiary: TERTIARY,
  textLight: '!shadow-none bg-transparent text-gray-500 focus:outline-none focus:text-black',
  primaryLight: PRIMARY_LIGHT,
} as const;

export type AnchorButtonProps = {
  danger?: boolean;
  icon?: React.ReactElement<SVGElement | HTMLDivElement>;
  loading?: boolean;
  disabled?: boolean;
  size?: keyof typeof classes.size;
  variant?: keyof typeof classes.variant;
};

// Button props
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & AnchorButtonProps;

// Anchor props
export type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & AnchorButtonProps;

// Input/output options
type Overload = {
  (props: ButtonProps): JSX.Element;
  (props: AnchorProps): JSX.Element;
};

// Guard to check if href exists in props
const hasHref = (props: ButtonProps | AnchorProps): props is AnchorProps => 'href' in props;
const buildClassName = ({
  className,
  danger,
  disabled,
  loading,
  size,
  variant,
}: ButtonProps | AnchorProps) =>
  classNames(
    classes.base,
    danger ? classes.variant[variant].danger : classes.variant[variant].default,
    classes.size[size],
    disabled && classes.disabled,
    disabled && classes.variant[variant].disabled,
    loading && classes.disabled,
    className,
  );

const ButtonTemplate: React.FC<AnchorButtonProps> = ({ danger, icon, loading, size, variant }) => (
  <>
    {!loading && icon && (
      <div className="mr-2">
        {React.cloneElement(icon, {
          className: classNames(
            {
              'w-3 h-3': size === 'xs',
              'w-4 h-4': size !== 'xs',
              'text-gray-900': variant === 'white',
            },
            icon.props?.className,
          ),
        })}
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
  </>
);

export const Anchor = forwardRef<HTMLAnchorElement, AnchorProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'base',
      className,
      disabled = false,
      icon,
      danger = false,
      ...restProps
    }: AnchorProps,
    ref,
  ) =>
    disabled ? (
      <div className={buildClassName({ className, danger, disabled, icon, size, variant })}>
        <ButtonTemplate {...{ danger, icon, size, variant }} />
        <div className="whitespace-nowrap">{children}</div>
      </div>
    ) : (
      <a
        className={buildClassName({ className, danger, disabled, icon, size, variant })}
        {...restProps}
        ref={ref}
      >
        <ButtonTemplate {...{ danger, icon, size, variant }} />
        <div className="whitespace-nowrap">{children}</div>
      </a>
    ),
);

Anchor.displayName = 'Anchor';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'base',
  className,
  disabled = false,
  loading = false,
  icon,
  danger = false,
  ...restProps
}) => (
  <button
    type="button"
    className={buildClassName({ className, danger, disabled, icon, loading, size, variant })}
    disabled={loading || disabled}
    {...restProps}
  >
    <ButtonTemplate {...{ danger, icon, loading, size, variant }} />
    <div className="whitespace-nowrap">{children}</div>
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
