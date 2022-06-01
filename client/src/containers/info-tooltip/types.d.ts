import { UseFloatingProps } from '@floating-ui/react-dom/src';
import React from 'react';

/** TippyProps: https://atomiks.github.io/tippyjs/v6/all-props */
export interface InfoTooltipProps extends UseFloatingProps {
  icon?: 'solid' | 'outline';
  info: React.ReactNode;
}
