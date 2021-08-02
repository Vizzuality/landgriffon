export type Indicator = {
  id: string;
  name: string;
};

export type Year = {
  id: string;
  name: string;
};

export type Group = {
  id: string;
  name: string;
};

export type Material = {
  id: string;
  name: string;
  children: Material[];
};

export type OriginRegion = {
  id: string;
  name: string;
};
