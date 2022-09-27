import type React from 'react';

export interface AdminLayoutProps extends React.PropsWithChildren {
  children: React.ReactNode;
  title?: string;
}
