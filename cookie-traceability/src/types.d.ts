import type { Color } from '@deck.gl/core/typed';

export type H3Row = {
  h3index: string;
  value: number;
};

export type ColorsMap = Record<H3Row['value'], Color>;
