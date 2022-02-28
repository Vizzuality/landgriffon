import { TippyProps } from '@tippyjs/react';

/** TippyProps: https://atomiks.github.io/tippyjs/v6/all-props */
export type TooltipProps = PropsWithChildren &
  TippyProps & {
    /** Classnames to apply to the Tooltip wrapper */
    className: string;
  };
