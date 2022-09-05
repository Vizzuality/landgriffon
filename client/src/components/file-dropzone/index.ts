import dynamic from 'next/dynamic';

const FileDropZoneNoSSR = dynamic(() => import('./component'), {
  ssr: false,
});

export default FileDropZoneNoSSR;
