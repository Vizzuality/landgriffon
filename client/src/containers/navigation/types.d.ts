export type NavigationItem = {
  name: string;
  href: string;
  icon: { default: typeof JSX.Element; active: typeof JSX.Element };
  disabled?: boolean;
};

export type NavigationList = NavigationItem[];

export type NavigationProps = {
  items: NavigationList;
};
