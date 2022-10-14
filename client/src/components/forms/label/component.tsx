import classnames from 'classnames';

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  error?: string;
};

const Label: React.FC<LabelProps> = ({ className, children, ...props }) => (
  <label
    className={classnames('block text-sm font-medium text-gray-900 mb-1', className)}
    {...props}
  >
    {children}
  </label>
);

export default Label;
