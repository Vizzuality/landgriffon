export type Step = {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  href?: string;
  status: 'complete' | 'current' | 'upcoming';
};
