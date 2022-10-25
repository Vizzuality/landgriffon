import type { DropzoneOptions } from 'react-dropzone';

export type FileDropZoneProps = DropzoneOptions & {
  isUploading?: boolean;
};
