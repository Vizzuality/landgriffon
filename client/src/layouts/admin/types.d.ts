import type React from 'react';
import type { TabsType } from 'components/tabs';

export interface AdminLayoutProps extends React.PropsWithChildren {
  children: React.ReactNode;
  title?: string;
  adminTabs?: TabsType;
}
