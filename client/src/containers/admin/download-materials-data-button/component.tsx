import { useCallback, useEffect, useState } from 'react';
import { DownloadIcon } from '@heroicons/react/solid';

import Button from 'components/button';
import {
  useSourcingLocations,
  useSourcingLocationsMaterials,
  useSourcingLocationsMaterialsTabularData,
} from 'hooks/sourcing-locations';
import { csvDownload } from 'utils/csv-download';

const DownloadMaterialsDataButton: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const {
    data: sourcingLocations,
    isLoading: isSourcingLocationsLoading,
    refetch: sourcingLocationsRefetch,
  } = useSourcingLocations(
    {
      fields: 'updatedAt',
      'page[number]': 1,
      'page[size]': 1,
    },
    {
      keepPreviousData: false,
      enabled: false,
    },
  );

  const {
    data: sourcingData,
    isFetching: isSourcingDataFetching,
    isSuccess,
    isFetched,
    refetch: sourcingDataRefetch,
  } = useSourcingLocationsMaterials(
    {
      disablePagination: true,
    },
    {
      keepPreviousData: false,
      enabled: false,
    },
  );

  const { data } = useSourcingLocationsMaterialsTabularData(sourcingData);
  const { updatedAt } = sourcingLocations?.data?.[0];

  const handleDownload = useCallback(() => {
    setIsDownloading(true);
    sourcingLocationsRefetch();
    sourcingDataRefetch();
  }, [sourcingDataRefetch, sourcingLocationsRefetch]);

  useEffect(() => {
    if (isFetched && isSuccess && isDownloading) {
      csvDownload({
        data,
        filename: `data_procurement_${updatedAt || ''}.csv`,
      });
      setIsDownloading(false);
    }
  }, [isFetched, isSuccess, data, updatedAt, isDownloading]);

  return (
    <Button
      variant="secondary"
      loading={isSourcingDataFetching || isSourcingLocationsLoading || isDownloading}
      icon={<DownloadIcon />}
      onClick={handleDownload}
    >
      Download
    </Button>
  );
};

export default DownloadMaterialsDataButton;
