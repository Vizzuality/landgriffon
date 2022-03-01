export type BadgeProps = {
  data?: unknown;
  children?: React.ReactNode;
  className?: string;
  removable?: boolean;
  onClick?: (data: BadgeProps['data']) => void;
  theme?: string;
};
