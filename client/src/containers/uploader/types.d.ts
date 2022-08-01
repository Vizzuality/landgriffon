export type UploaderProps = {
  /**
   * Element to display just above the dropzone. Can be text or a ReactNode.
   */
  header?: React.ReactNode;
  /**
   * Element to display just below the dropzone. Can be text or a ReactNode.
   * It will be shown above error messages/notices, if any.
   */
  footer?: React.ReactNode;
  /**
   * Key associated with the files to upload.
   * Defaults to 'file'.
   */
  key?: string;
  /**
   * API endpoint URL to upload to.
   */
  url?: string;
  /**
   * Accepted file types.
   */
  fileTypes?: string[];
  /**
   * Number of max files that the uploader will accept.
   * Defaults to `1`
   */
  maxFiles?: number;
  /**
   * Maximum size of the uploaded files, in bytes.
   * Defaults to the value set in the env variable `NEXT_PUBLIC_FILE_UPLOADER_MAX_SIZE`
   */
  maxSize?: number;
  /**
   * Whether the uploader should upload the files straight away after drop/selection.
   * Defaults to `false`.
   */
  autoUpload?: boolean;
  /**
   * Whether the uploader should show error messages, warnings, successful upload messages.
   * Defaults to `true`,
   */
  showAlerts?: boolean;
  /**
   * Whether the uploader should be disabled (both for drop and click).
   * Defaults to `false`.
   */
  disabled?: boolean;
  /* Callback executed when files are selected/dropped. */
  onSelected?: (files: Files[], { upload: func }) => void;
  /* Callback executed when files are rejected when being selected/dropped */
  onRejected?: (errors) => void;
  /* Callback executed when the uploader is uploading files. */
  onUploading?: (isUploading: boolean) => void;
  /* Callback executed when files have been successfully uploaded. */
  onUpload?: (response: AxiosResponse) => void;
  /* Callback executed when there was an error uploading files */
  onError?: (response) => void;
};
