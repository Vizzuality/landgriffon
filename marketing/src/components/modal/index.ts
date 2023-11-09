import dynamic from 'next/dynamic';

const ModalComponent = dynamic(() => import('./component'), { ssr: false });

export default ModalComponent;
export type { ModalProps } from './types';
