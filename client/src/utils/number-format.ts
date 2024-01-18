import { format } from 'd3-format';

// for numbers bigger than 1
export const NUMBER_FORMAT = format('.3~s');

// for numbers smaller than 1
export const SMALL_NUMBER_FORMAT = format('.3~g');

export function formatNumber(number: number): string {
  if (number < 1) {
    return SMALL_NUMBER_FORMAT(number);
  }
  return NUMBER_FORMAT(number);
}

export const PRECISE_NUMBER_FORMAT = format(',.3~r');

export const BIG_NUMBER_FORMAT = format('s');
