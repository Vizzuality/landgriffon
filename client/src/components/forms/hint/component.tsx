import classnames from 'classnames';

type Error = Readonly<{
  error?: boolean;
}>;

const Hint: React.FC<React.HTMLAttributes<HTMLElement> & Error> = ({
  children,
  error,
  ...props
}) => (
  <div className={classnames('mt-2 text-sm text-gray-400', { 'text-red-600': !!error })} {...props}>
    <p className="first-letter:uppercase">{children}</p>
  </div>
);

export default Hint;
