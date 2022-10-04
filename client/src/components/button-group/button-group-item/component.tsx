import classNames from 'classnames';
import type { ButtonGroupItemProps } from '../types';

const CONTROL_ITEM_CLASS_NAMES =
  'relative inline-flex items-center px-4 py-1.5 border -ml-px first:ml-0';
const CONTROL_ITEM_DEFAULT_CLASS_NAMES =
  'border-gray-100 bg-white text-sm font-medium text-gray-500 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700';
const CONTROL_ITEM_ACTIVE_CLASS_NAMES = 'z-10 text-primary bg-primary/20 pointer-events-none';

const ButtonGroupItem: React.FC<ButtonGroupItemProps> = ({ children, active, ...props }) => (
  <button
    className={classNames(
      CONTROL_ITEM_CLASS_NAMES,
      active ? CONTROL_ITEM_ACTIVE_CLASS_NAMES : CONTROL_ITEM_DEFAULT_CLASS_NAMES,
      'first:rounded-l-md last:rounded-r-md',
    )}
    type="button"
    {...props}
  >
    {children}
  </button>
);

export default ButtonGroupItem;
