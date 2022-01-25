export type TabType = {
  name: string;
  href: string;
};

export type TabsType = {
  [key: string]: TabType;
};

export type TabsProps = {
  activeTab?: TabType;
  tabs: TabsType;
  bottomBorder?: boolean;
};
