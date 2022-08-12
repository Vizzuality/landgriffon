import cx from 'classnames';
import type { SVGProps } from 'react';
import { forwardRef } from 'react';
import Loading from 'components/loading';

const COMMON_CLASSNAMES =
  'inline-flex items-center overflow-hidden justify-center rounded-md cursor-pointer';
const PRIMARY =
  'border-transparent shadow-sm text-white bg-primary hover:bg-green-800 focus:outline-offset-2 focus:outline focus:outline-green-600';
const SECONDARY =
  'border border-gray-300 focus:border-primary shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-700';
const TERTIARY = 'border border-primary text-primary';

export const THEME = {
  default: COMMON_CLASSNAMES,
  primary: PRIMARY,
  secondary: SECONDARY,
  tertiary: TERTIARY,
  textLight: 'bg-transparent text-gray-500 focus:outline-none focus:text-black',
};

const SIZE = {
  xs: 'font-medium text-xs px-2.5 py-1.5',
  base: 'font-medium text-sm px-4 py-2',
  xl: 'font-medium text-base px-6 py-3',
  text: 'font-normal text-sm p-0',
};

export type AnchorButtonProps = {
  theme?: 'primary' | 'secondary' | 'tertiary' | 'textLight';
  size?: 'xs' | 'base' | 'xl' | 'text';
  loading?: boolean;
  icon?: SVGProps<SVGElement>;
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
  disabled,
  size = 'base',
  theme = 'primary',
  loading = false,
}: AnchorProps) {
  return cx(COMMON_CLASSNAMES, THEME[theme], SIZE[size], {
    [className]: !!className,
    'opacity-50 pointer-events-none hover:bg-green-700': disabled,
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
      ...restProps
    }: AnchorProps,
    ref,
  ) => {
    // Anchor element doesn't support disabled attribute
    // https://www.w3.org/TR/2014/REC-html5-20141028/disabled-elements.html
    if (disabled) {
      return (
        <span {...restProps} ref={ref}>
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
      disabled,
      size,
      theme,
      loading,
    } as AnchorProps)}
    disabled={loading || disabled}
    {...restProps}
  >
    {icon && <span className="w-5 h-5 mr-4">{icon}</span>}
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
