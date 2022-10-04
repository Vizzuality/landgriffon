import type { HTMLAttributes } from 'react';

export type ButtonGroupItemProps = HTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};
