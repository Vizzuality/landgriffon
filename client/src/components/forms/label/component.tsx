const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, ...props }) => (
  <label className="block text-sm font-medium text-gray-900" {...props}>
    {children}
  </label>
);

export default Label;
