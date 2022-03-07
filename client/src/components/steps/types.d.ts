export type Step = {
  id: number;
  slug?: string;
  title: string;
  name: string;
  description?: string;
  href?: string;
  status: 'complete' | 'current' | 'upcoming';
};
