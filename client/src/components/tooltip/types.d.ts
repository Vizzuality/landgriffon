import React from 'react';

export type TooltipProps = React.PropsWithChildren<{
  className?: string;
  content: React.ReactNode;
  arrow?: boolean;
  color?: 'black' | 'white';
}>;
