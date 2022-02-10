export type Step = {
  id: string;
  name: string;
  href: string;
  description?: string,
  status: 'complete' | 'current' | 'upcoming';
};
