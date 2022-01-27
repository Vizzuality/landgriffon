export type UploaderProps = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  key?: string;
  url: string;
  fileTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
};
