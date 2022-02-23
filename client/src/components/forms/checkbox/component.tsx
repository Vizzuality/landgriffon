import Hint from '../hint';
import classnames from 'classnames';

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

const Checkbox: React.FC<CheckboxProps> = ({ error, children, ...props }) => (
  <div>
    <div className="flex items-center">
      <input
        className={classnames(
          'h-4 w-4 text-green-700 focus:ring-green-700 border-gray-700 rounded',
          {
            'border-red-600': !!error,
          },
        )}
        {...props}
        type="checkbox"
      />
      <label htmlFor={props.id} className="ml-2 block text-sm text-gray-900">
        {children}
      </label>
    </div>
    {error && <Hint>{error}</Hint>}
  </div>
);

export default Checkbox;
