import { Placement } from '@floating-ui/react-dom';
import React from 'react';

export type TooltipProps = PropsWithChildren<{
  className?: string;
  content: React.ReactNode;
  arrow?: boolean;
  theme?: 'light' | 'dark';
  placement?: Placement;
}>;
