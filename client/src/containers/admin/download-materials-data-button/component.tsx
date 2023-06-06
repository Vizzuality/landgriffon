import { useCallback, useEffect, useMemo, useState } from 'react';
import { DownloadIcon } from '@heroicons/react/solid';

import Button from 'components/button';
import {
  useSourcingLocations,
  useSourcingLocationsMaterials,
  useSourcingLocationsMaterialsTabularData,
} from 'hooks/sourcing-locations';
import { csvDownload } from 'utils/csv-download';

const yearExp = new RegExp(/^[0-9]{4}$/);

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
  const parsedData = useMemo(
    () =>
      data.map((row) => {
        // Adding _tons to the end of the year keys
        Object.keys(row)
          // Sorting years at the end
          .sort((a, b) => yearExp.test(a) && yearExp.test(b) && parseInt(a, 10) - parseInt(b, 10))
          .forEach((key) => {
            const newKey = yearExp.test(key) && `${key}_tons`;
            if (newKey) delete Object.assign(row, { [newKey]: row[key] })[key];
          });
        return row;
      }),
    [data],
  );
  const { updatedAt } = sourcingLocations?.data?.[0];

  const handleDownload = useCallback(() => {
    setIsDownloading(true);
    sourcingLocationsRefetch();
    sourcingDataRefetch();
  }, [sourcingDataRefetch, sourcingLocationsRefetch]);

  useEffect(() => {
    if (isFetched && isSuccess && isDownloading) {
      csvDownload({
        data: parsedData,
        filename: `data_procurement_${updatedAt || ''}.csv`,
      });
      setIsDownloading(false);
    }
  }, [isFetched, isSuccess, parsedData, updatedAt, isDownloading]);

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
