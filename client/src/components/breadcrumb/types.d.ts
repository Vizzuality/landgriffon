export type Page = {
  mode: 'list' | 'edit' | 'new';
  name: string;
  href: 'edit' | 'new' | 'analysis';
};
