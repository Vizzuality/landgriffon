import type { ButtonProps } from 'components/button/component';

export type DownloadMaterialsDataButtonProps = {
  /** Classnames to apply to the component */
  className?: string;
  /** Callback when downloading data/file starts */
  onDownloading?: () => void;
  /** Callback on success downloading data/file */
  onSuccess?: () => void;
  /** Callback on error downloading data/file */
  onError?: (error: undefined | string) => void;

  buttonProps?: ButtonProps;
  /** Name of the downloaded file */
  fileName?: string;
};
