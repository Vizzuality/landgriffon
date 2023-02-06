export type AlertsItemProps = {
  /* Type of alert to display */
  type: 'success' | 'error' | 'warning';
  /* Alert title / main message */
  title: string;
  /* Sub-messages to display below the alert title / message, as list items */
  messages?: string[];
};

export type AlertsProps = {
  /* Classnames to apply to the Alerts wrapper */
  className?: string;
  /* Array of alert items */
  items?: AlertsItemProps | AlertsItemProps[];
};
