import { TabType } from 'components/tabs';

export type AdminLayoutProps = {
  loading?: boolean;
  children: React.ReactNode;
  currentTab?: TabType;
  title?: string;
};
