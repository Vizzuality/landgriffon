import { useState, useEffect, useCallback, useMemo } from 'react';
import { Select } from 'antd';
import type { UseQueryResult } from 'react-query';
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid';

import type { OriginRegion } from 'types';

type OriginRegionsFilterProps = {
  originRegions: {
    data: OriginRegion[];
    isLoading: UseQueryResult['isLoading'];
    error: UseQueryResult['error'];
  };
};

const OriginRegionsFilter: React.FC<OriginRegionsFilterProps> = ({
  originRegions,
}: OriginRegionsFilterProps) => {
  const [value, setValue] = useState([]);
  const { data, isLoading, error } = originRegions;

  // useEffect(() => {
  //   if (!isLoading && data) setValue(data[0].id);
  // }, [data, isLoading]);

  const handleChange = useCallback((currentValue) => {
    setValue(currentValue);
  }, []);

  const options = useMemo(
    () =>
      data && data.map((originRegion) => ({ label: originRegion.name, value: originRegion.id })),
    [data]
  );

  return (
    <div>
      <div className="mb-1">Origin regions</div>
      <Select
        onChange={handleChange}
        className="w-full"
        loading={isLoading}
        options={options}
        mode="multiple"
        showArrow
        suffixIcon={<ChevronDownIcon />}
        value={value}
        placeholder={error ? 'Something went wrong' : 'Select origin regions'}
        disabled={!!error}
        removeIcon={<XIcon />}
      />
    </div>
  );
};

export default OriginRegionsFilter;
