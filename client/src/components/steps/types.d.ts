export type Step = {
  id: string;
  slug?: string;
  name: string;
  href: string;
  description?: string;
  status: 'complete' | 'current' | 'upcoming';
};
