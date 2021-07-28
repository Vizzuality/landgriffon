import { useState, useEffect, useCallback, useMemo } from 'react';
import { Select } from 'antd';
import type { UseQueryResult } from 'react-query';

import type { Indicator } from 'types';

type ImpactIndicatorsFilterProps = {
  indicators: {
    data: Indicator[];
    isLoading: UseQueryResult['isLoading'];
    error: UseQueryResult['error'];
  };
};

const ImpactIndicatorsFilter: React.FC<ImpactIndicatorsFilterProps> = ({
  indicators,
}: ImpactIndicatorsFilterProps) => {
  const [value, setValue] = useState(null);
  const { data, isLoading, error } = indicators;

  useEffect(() => {
    if (!isLoading && data) setValue(data[0].id);
  }, [data, isLoading]);

  const handleChange = useCallback((currentValue) => {
    setValue(currentValue);
  }, []);

  const options = useMemo(
    () => data && data.map((indicator) => ({ label: indicator.name, value: indicator.id })),
    [data]
  );

  return (
    <Select
      onChange={handleChange}
      className="w-60"
      loading={isLoading}
      options={options}
      value={value}
      placeholder={error ? 'Something went wrong' : null}
      disabled={!!error}
    />
  );
};

export default ImpactIndicatorsFilter;
