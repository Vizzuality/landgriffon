export type AlertsItemProps = {
  type: 'success' | 'error' | 'warning';
  title: string;
  messages?: string[];
};

export type AlertsProps = {
  className?: string;
  items?: AlertsItemProps | AlertsItemProps[];
};
