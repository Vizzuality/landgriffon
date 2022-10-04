export type DownloaderHeadersType = {
  /** Header key */
  key: string;
  /** Header label */
  label: string;
};

export type DownloaderTransformProps = {
  headers: DownloaderHeadersType[];
  data: unknown[];
};

export type DownloaderProps = PropsWithChildren & {
  /** Classnames to apply to the component */
  className?: string;
  /** Type of download. Currently only 'csv' is supported. Defaults to 'csv'. */
  type?: 'csv';
  /** URL of the endpoint to get data from */
  url: string;
  /** params to pass to the endpoint */
  params?: Record<string, string>;
  /** Custom headers for export */
  headers?: DownloaderHeadersType[];
  /** Callback to transform the headers/data prior to export  */
  transform?: ({ headers, data }: DownloaderTransformProps) => DownloaderTransformProps;
  /** Callback when downloading data/file starts */
  onDownloading?: () => void;
  /** Callback on success downloading data/file */
  onSuccess?: () => void;
  /** Callback on error downloading data/file */
  onError?: (error) => void;
};
