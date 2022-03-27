import { useState } from 'react';
import { flatten, noop, pick, uniq } from 'lodash';

import Downloader, { DownloaderHeadersType, DownloaderTransformProps } from 'containers/downloader';

import Button from 'components/button';
import Loading from 'components/loading';

import { DownloadMaterialsDataButtonProps } from './types';

const DEFAULT_HEADERS: DownloaderHeadersType[] = [
  { key: 'materialName', label: 'Material' },
  { key: 'businessUnit', label: 'Business unit' },
  { key: 't1Supplier', label: 'Tier 1 Supplier' },
  { key: 'producer', label: 'Producer' },
  { key: 'locationType', label: 'Location type' },
  { key: 'country', label: 'Country' },
];

const DownloadMaterialsDataButton: React.FC<DownloadMaterialsDataButtonProps> = ({
  className,
  onDownloading = noop,
  onSuccess = noop,
  onError = noop,
}: DownloadMaterialsDataButtonProps) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const transformer = ({
    data: originalData,
  }: DownloaderTransformProps): DownloaderTransformProps => {
    const years = uniq(
      flatten(originalData.map(({ purchases }) => purchases.map(({ year }) => year))).sort(),
    );

    const headers = [
      ...DEFAULT_HEADERS,
      ...years.map((year) => ({ key: year.toString(), label: year })),
    ];

    const fieldsToExport = headers.map(({ key }) => key);

    const data = originalData
      .map((dataRow: Record<string, unknown>) => ({
        ...dataRow,
        ...(dataRow.purchases as { year: number; tonnage: number }[])
          .map(({ year, tonnage }) => ({ [year]: tonnage }))
          .reduce((a, b) => ({ ...a, ...b })),
      }))
      .map((dataRow) => pick(dataRow, fieldsToExport));

    return { headers, data };
  };

  const handleOnDownloading = () => {
    setIsDownloading(true);
    onDownloading();
  };

  const handleOnSuccess = () => {
    setIsDownloading(false);
    onSuccess();
  };

  const handleOnError = () => {
    setIsDownloading(false);
    onError('There was an error processing the data for download.');
  };

  return (
    <Downloader
      className={className}
      url="/sourcing-locations/materials"
      transformer={transformer}
      onDownloading={handleOnDownloading}
      onSuccess={handleOnSuccess}
      onError={handleOnError}
    >
      <Button theme="secondary">
        Download
        {isDownloading && <Loading className="ml-2" />}
      </Button>
    </Downloader>
  );
};

export default DownloadMaterialsDataButton;
