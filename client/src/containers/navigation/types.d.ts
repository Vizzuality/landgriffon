export type NavigationItem = {
  name: string;
  href: string;
  icon: typeof JSX.Element;
  disabled?: boolean;
};

export type NavigationList = NavigationItem[];

export type NavigationProps = {
  items: NavigationList;
};
