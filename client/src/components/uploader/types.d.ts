export type UploaderProps = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  key?: string;
  url?: string;
  fileTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
  autoUpload?: boolean;
  showAlerts?: boolean;
  disabled?: boolean;
  onSelected?: (files: Files[], { upload: func }) => void;
  onRejected?: (errors) => void;
  onUploading?: (isUploading: boolean) => void;
  onUpload?: (response: AxiosResponse) => void;
  onError?: (response) => void;
};
