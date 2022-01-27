import classNames from 'classnames';
import { CheckCircleIcon, XCircleIcon, ExclamationIcon } from '@heroicons/react/solid';

import { AlertsProps } from './types';

const ALERT_CLASSES = {
  success: {
    iconClassnames: 'mr-2 h-5 w-5 fill-green-600',
    backgroundColor: 'bg-green-100',
    titleColor: 'text-green-800',
    messagesColor: 'text-green-900',
  },
  error: {
    iconClassnames: 'mr-2 h-5 w-5 fill-red-700',
    backgroundColor: 'bg-red-100',
    titleColor: 'text-red-800',
    messagesColor: 'text-red-900',
  },
  warning: {
    iconClassnames: 'mr-2 h-5 w-5 fill-yellow-500',
    backgroundColor: 'bg-yellow-100',
    titleColor: 'text-yellow-600',
    messagesColor: 'text-yellow-900',
  },
};

const Alerts: React.FC<AlertsProps> = ({ className, items }: AlertsProps) => {
  if (!items) return null;
  if (Array.isArray(items) && !items.length) return null;

  const alerts = Array.isArray(items) ? items : [items];

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={ALERT_CLASSES[type].iconClassnames} />;
      case 'error':
        return <XCircleIcon className={ALERT_CLASSES[type].iconClassnames} />;
      case 'warning':
        return <ExclamationIcon className={ALERT_CLASSES[type].iconClassnames} />;
      default:
        return null;
    }
  };

  return (
    <div className={classNames('my-4', className)}>
      {alerts.map(({ type, title, messages }, alertsIdx) => (
        <div
          key={alertsIdx}
          className={classNames('rounded text-sm py-4 px-5', ALERT_CLASSES[type].backgroundColor)}
        >
          <div className="flex items-center">
            {getIcon(type)}
            <p className={ALERT_CLASSES[type].titleColor}>{title}</p>
          </div>
          {(messages || []).length > 0 && (
            <ul className={classNames('list-disc mt-2 pl-14', ALERT_CLASSES[type].messagesColor)}>
              {messages.map((message, messagesIdx) => (
                <li key={messagesIdx}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default Alerts;
