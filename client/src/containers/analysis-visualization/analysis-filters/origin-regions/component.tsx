import { useState, useCallback, useMemo } from 'react';
import { Select, SelectProps } from 'antd';
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid';
import { useQuery } from 'react-query';

import { getOriginRegions } from 'services/origin-regions';

type OriginRegionsFilterProps = SelectProps<{}> & {
  onChange: (value) => void;
};

const OriginRegionsFilter: React.FC<OriginRegionsFilterProps> = (
  props: OriginRegionsFilterProps
) => {
  const [value, setValue] = useState([]);
  const { data, isLoading, error } = useQuery('originRegionsList', getOriginRegions);

  const handleChange = useCallback((currentValue) => {
    setValue(currentValue);
  }, []);

  const options = useMemo(
    () =>
      data && data.map((originRegion) => ({ label: originRegion.name, value: originRegion.id })),
    [data]
  );

  return (
    <Select
      onChange={handleChange}
      loading={isLoading}
      options={options}
      mode="multiple"
      showArrow
      suffixIcon={<ChevronDownIcon />}
      value={value}
      placeholder={error ? 'Something went wrong' : 'Select origin regions'}
      disabled={!!error}
      removeIcon={<XIcon />}
      maxTagCount={5}
      maxTagPlaceholder={(e) => `${e.length} more...`}
      {...props}
    />
  );
};

export default OriginRegionsFilter;
