import classNames from 'classnames';
import { toast, Toaster, resolveValue } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, XIcon } from '@heroicons/react/solid';

import type { ToasterProps } from 'react-hot-toast';

export const ALERT_CLASSES = {
  success: {
    iconColor: 'fill-green-400',
    backgroundColor: 'bg-green-50',
    messagesColor: 'text-green-800',
  },
  error: {
    iconColor: 'fill-red-400',
    backgroundColor: 'bg-red-50',
    messagesColor: 'text-red-800',
  },
  warning: {
    iconColor: 'fill-orange-300',
    backgroundColor: 'bg-orange-50',
    messagesColor: 'text-orange-500',
  },
  loading: {
    iconColor: 'fill-orange-300',
    backgroundColor: 'bg-orange-50',
    messagesColor: 'text-orange-500',
  },
};

const ToastContainer: React.FC<ToasterProps> = (props) => (
  <Toaster {...props}>
    {(t) => {
      const { iconColor, backgroundColor, messagesColor } = ALERT_CLASSES[t.type];
      return (
        <div
          className={classNames('rounded-md text-sm py-4 px-4 max-w-4xl relative', backgroundColor)}
        >
          <div className="flex items-center space-x-4">
            <div className="flex-none">
              {t.type === 'success' && (
                <CheckCircleIcon className={classNames('h-5 w-5', iconColor)} />
              )}
              {t.type === 'error' && <XCircleIcon className={classNames('h-5 w-5', iconColor)} />}
            </div>
            <div
              className={classNames('flex-1 text-sm', messagesColor)}
              data-testid="toast-message"
            >
              {resolveValue(t.message, t)}
            </div>
            <button type="button" onClick={() => toast.dismiss(t.id)} className="flex-none">
              <XIcon className={classNames('h-4 w-4', iconColor)} />
            </button>
          </div>
        </div>
      );
    }}
  </Toaster>
);

export default ToastContainer;
