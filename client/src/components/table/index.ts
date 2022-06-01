import dynamic from 'next/dynamic';

export { default } from './component';
export type { TableProps, ApiSortingType } from './types';
export { DataType, SortingMode, ApiSortingDirection } from './enums';

export const TableNoSSR = dynamic(() => import('./component'), {
  ssr: false,
});
