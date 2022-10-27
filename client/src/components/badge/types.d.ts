import type { THEMES } from './constants';

export type BadgeProps = {
  data?: unknown;
  children?: React.ReactNode;
  className?: string;
  removable?: boolean;
  onClick?: (data: BadgeProps['data']) => void;
  theme?: keyof typeof THEMES;
};
