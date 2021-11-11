import { format } from 'd3-format';
import type { ColorRamps } from 'types';

export const COLOR_RAMPS: ColorRamps = {
  impact: ['#FFC300', '#F1920E', '#E3611C', '#C70039', '#900C3F', '#5A1846'],
  risk: ['#FEF0D9', '#FDD49E', '#FDBB84', '#FC8D59', '#E34A33', '#B30000'],
  material: ['#FEFEE3', '#FCEEB7', '#F8CF69', '#F2A400', '#E17100', '#AA4800'],
};

export const NUMBER_FORMAT = format(',.1s');
