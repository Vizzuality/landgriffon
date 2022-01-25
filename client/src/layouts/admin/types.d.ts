import { TabType } from 'components/tabs';

export type AdminLayoutProps = {
  loading?: boolean;
  children: React.ReactNode;
  headerButtons?: React.ReactNode;
  currentTab?: TabType;
};
