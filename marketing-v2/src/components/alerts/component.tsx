import classNames from 'classnames';
import { CheckCircleIcon, XCircleIcon, ExclamationIcon } from '@heroicons/react/solid';

import { ALERT_CLASSES } from './constants';
import { AlertsProps } from './types';

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
