import dynamic from 'next/dynamic';

export { default } from './component';

export const TableNoSSR = dynamic(() => import('./component'), {
  ssr: false,
});
