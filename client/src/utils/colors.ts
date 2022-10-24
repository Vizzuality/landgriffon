import { useMemo } from 'react';
import chroma from 'chroma-js';

import type { RGBColor, ColorRamps } from 'types';

export const COLOR_RAMPS: ColorRamps = {
  impact: ['#FFC300', '#F1920E', '#E3611C', '#C70039', '#900C3F', '#5A1846'],
  risk: ['#FEF0D9', '#FDD49E', '#FDBB84', '#FC8D59', '#E34A33', '#B30000'],
  water: ['#FEF0D9', '#FDD49E', '#FDBB84', '#FC8D59', '#E34A33', '#B30000'],
  material: ['#FFFFCC', '#D9F0A3', '#ADDD8E', '#78C679', '#31A354', '#006837'],
  compare: ['#078A3C', '#6FCF96', '#DAEDE2', '#FAE2E5', '#F5AFB8', '#E03148'],
};

export function useColors(layerName: string, colorScale): RGBColor[] {
  const colors = useMemo(
    () => colorScale[layerName].map((color) => chroma(color).rgb()),
    [colorScale, layerName],
  );
  return colors;
}
