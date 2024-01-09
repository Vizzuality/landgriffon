import classnames from 'classnames';

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  error?: string;
};

const Label: React.FC<LabelProps> = ({ className, children, ...props }) => (
  <label
    className={classnames('mb-1 block text-sm font-medium text-gray-900', className)}
    {...props}
  >
    {children}
  </label>
);

export default Label;
