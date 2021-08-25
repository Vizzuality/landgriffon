import cx from 'classnames';

const COMMON_CLASSNAMES = 'inline-flex items-center justify-center rounded-md cursor-pointer';

const THEME = {
  primary:
    'border-transparent shadow-sm text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-1 focus:ring-green-700',
  secondary:
    'border border-gray-300 focus:border-green-700 shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-700',
  textLight: 'bg-transparent text-gray-500 focus:outline-none focus:text-black',
};

const SIZE = {
  xs: 'font-medium text-xs px-2.5 py-1.5',
  base: 'font-medium text-sm px-4 py-2',
  xl: 'font-medium text-base px-6 py-3',
  text: 'font-normal text-sm p-0',
};

export type AnchorButtonProps = {
  theme?: 'primary' | 'secondary' | 'textLight';
  size?: 'xs' | 'base' | 'xl' | 'text';
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

function buildClassName({ className, disabled, size = 'base', theme = 'primary' }: AnchorProps) {
  return cx(COMMON_CLASSNAMES, THEME[theme], SIZE[size], {
    [className]: !!className,
    'opacity-50 pointer-events-none': disabled,
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

export const Button: React.FC<ButtonProps> = ({
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

export const LinkButton: Overload = (props: AnchorProps | ButtonProps) => {
  // We consider a link button when href attribute exits
  if (hasHref(props)) {
    return <Anchor {...props} />;
  }
  return <Button {...props} />;
};

export default LinkButton;
