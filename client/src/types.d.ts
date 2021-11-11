export type RGBColor = [number, number, number];

export type HEXColor = string;

export type ColorRamps = Record<string, HEXColor[]>;

export type H3Item = {
  c: RGBColor;
  h: string;
  v: number;
};

export type H3Data = H3Item[] | [];

export type H3APIResponse = {
  data: H3Data;
  metadata: {
    quantiles: number[];
    unit: string;
  };
};

export type Indicator = {
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

export type Supplier = {
  id: string;
  name: string;
  children: Supplier[];
};

export type OriginRegion = {
  id: string;
  name: string;
};
