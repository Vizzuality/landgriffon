import React from 'react';

export type TooltipProps = PropsWithChildren<{
  className?: string;
  content: React.ReactNode;
  arrow?: boolean;
}>;
