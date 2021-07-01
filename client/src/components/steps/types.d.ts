export type Step = {
  id: string;
  name: string;
  href: string;
  status: 'complete' | 'current' | 'upcoming';
};
