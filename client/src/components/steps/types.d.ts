export type Step = {
<<<<<<< HEAD
  id: number;
  slug?: string;
  title: string;
=======
  id: string;
  slug?: number;
>>>>>>> 1701329b (new scen componentized, scen attributes removed)
  name: string;
  description?: string;
  href?: string;
  status: 'complete' | 'current' | 'upcoming';
};
