import { useState, useEffect } from 'react';
import { CSVDownload } from 'react-csv';
import { noop } from 'lodash';

import { apiService } from 'services/api';

import type { DownloaderProps } from './types';

const DEFAULT_PARAMS = {
  disablePagination: true,
};

const Downloader: React.FC<DownloaderProps> = ({
  className,
  type = 'csv',
  url,
  params,
  headers: propsHeaders,
  transformer,
  onDownloading = noop,
  onSuccess = noop,
  onError = noop,
  children,
}: DownloaderProps) => {
  const [headers, setHeaders] = useState<Record<string, string>[]>(null);
  const [data, setData] = useState<Record<string, string>[]>(null);

  // TODO: consider replace by a hook
  const getDataForExport = () =>
    apiService
      .request({
        method: 'GET',
        url: url,
        params: { ...DEFAULT_PARAMS, ...params },
      })
      .then(({ data }) =>
        transformer
          ? transformer({
              headers: propsHeaders,
              data: data.data,
            })
          : { headers: propsHeaders, data: data.data },
      );

  const handleClick = () => {
    onDownloading();
    switch (type) {
      case 'csv':
        getDataForExport()
          .then(({ headers, data }) => {
            headers && setHeaders(headers);
            data && setData(data);
            onSuccess();
          })
          .catch(onError);
        return;
      // TODO: Other export formats
      default:
        const errorMessage = `Export format ${type} not yet supported`;
        onError(errorMessage);
        return;
    }
  };

  useEffect(() => {
    if (!data) return;
    setHeaders(null);
    setData(null);
  }, [data]);

  const shouldTriggerDownload = data && data.length > 0;

  return (
    <>
      <div className={className} onClick={handleClick}>
        {children}
      </div>
      {shouldTriggerDownload && (
        <>
          {type === 'csv' && (
            <CSVDownload target="_blank" data={data} {...(headers && { headers })} />
          )}
          {/* TODO: Other export formats */}
        </>
      )}
    </>
  );
};

export default Downloader;
