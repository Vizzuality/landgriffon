import { AlertsItemProps } from 'components/alerts';

export type UserProfilePayload = {
  fname?: string;
  lname?: string;
  email: string;
  password?: string;
};

export type formProps = {
  alert: (msg: AlertsItemProps) => void;
  showAlert: (showAlert: boolean) => void;
};
