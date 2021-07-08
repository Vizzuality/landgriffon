export type Scenario = {
  id: string | number;
  title: string;
  description?: string;
  updatedAt?: date;
};

export type Scenarios = Scenario[];
