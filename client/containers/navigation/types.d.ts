export type NavigationItem = {
  name: string;
  href: string;
  icon: typeof JSX.Element;
};

export type NavigationList = NavigationItem[];

export type NavigationProps = {
  items: NavigationList;
};
