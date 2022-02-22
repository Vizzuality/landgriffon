export type Step = {
  id: string;
  slug?: number;
  name: string;
  description?: string;
  href?: string;
  status: 'complete' | 'current' | 'upcoming';
};
