import { format } from 'd3-format';

// for numbers bigger than 1
export const NUMBER_FORMAT = format('.2~s');

// for numbers smaller than 1
export const SMALL_NUMBER_FORMAT = format('.2~g');

export function formatNumber(number: number): string {
  if (Math.abs(number) < 1) {
    if (Math.abs(number) < 0.001) {
      return "< 0.001";
    }
    return SMALL_NUMBER_FORMAT(number)
  }
  return NUMBER_FORMAT(number);
}

export const PRECISE_NUMBER_FORMAT = format(',.3~r');

export const BIG_NUMBER_FORMAT = format('s');
