import classNames from 'classnames';
import { Toaster, resolveValue } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/solid';

import type { ToasterProps } from 'react-hot-toast';

export const ALERT_CLASSES = {
  success: {
    iconColor: 'fill-green-600',
    backgroundColor: 'bg-green-50',
    messagesColor: 'text-green-800',
  },
  error: {
    iconColor: 'mr-2 h-5 w-5 fill-red-400',
    backgroundColor: 'bg-red-50',
    messagesColor: 'text-red-800',
  },
  warning: {
    iconColor: 'mr-2 h-5 w-5 fill-orange-300',
    backgroundColor: 'bg-yellow-50',
    messagesColor: 'text-yellow-500',
  },
};

const Alert: React.FC<ToasterProps> = (props) => (
  <Toaster {...props}>
    {(t) => {
      const { iconColor, backgroundColor, messagesColor } = ALERT_CLASSES[t.type];
      return (
        <div className={classNames('rounded text-sm py-4 px-5 max-w-4xl', backgroundColor)}>
          <div className="flex items-start">
            <div className="flex-none">
              {t.type === 'success' && (
                <CheckCircleIcon className={classNames('mr-2 h-5 w-5', iconColor)} />
              )}
              {t.type === 'error' && (
                <XCircleIcon className={classNames('mr-2 h-5 w-5', iconColor)} />
              )}
            </div>
            <p className={classNames('flex-1 text-sm', messagesColor)}>
              {resolveValue(t.message, t)}
            </p>
          </div>
        </div>
      );
    }}
  </Toaster>
);

export default Alert;
