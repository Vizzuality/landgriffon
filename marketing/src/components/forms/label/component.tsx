import classnames from 'classnames';

const THEMES = {
  default: 'block text-sm font-medium text-gray-900',
};

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  theme?: 'default';
  error?: string;
};

const Label: React.FC<LabelProps> = ({ className, theme = 'default', children, ...props }) => (
  <label className={classnames(className, [THEMES[theme]])} {...props}>
    {children}
  </label>
);

export default Label;
