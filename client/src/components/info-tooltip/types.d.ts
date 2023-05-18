import type { UseFloatingProps } from '@floating-ui/react-dom/src';
import type React from 'react';

/** TippyProps: https://atomiks.github.io/tippyjs/v6/all-props */
export interface InfoTooltipProps extends UseFloatingProps {
  info: React.ReactNode;
}
