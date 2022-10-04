export type TabType = {
  /** Tab name / text to be displayed */
  name: string;
  /** Tab href / where to link */
  href: string;
};

export type TabsType = {
  [key: string]: TabType;
};

export type TabsProps = {
  /* Which tab should be shown as active */
  activeTab?: TabType;
  /* Array of tab items to be shown. */
  tabs: TabsType;
  /**
   * Whether to display a bottom border around the tabs' wrapper.
   * Defaults to `true`
   */
  bottomBorder?: boolean;
};
