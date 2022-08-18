import type { TabType } from 'components/tabs';
import type React from 'react';

export interface AdminLayoutProps extends React.PropsWithChildren {
  loading?: boolean;
  children: React.ReactNode;
  currentTab?: TabType;
  title?: string;
}
