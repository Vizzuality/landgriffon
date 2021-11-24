import React, { useState, useCallback, useMemo } from 'react';
import { toNumber, isFinite } from 'lodash';

import Select from 'components/select';

import type { SelectOptions, SelectProps } from 'components/select/types';
import type { SingleYearFilterProps } from './types';

const SingleYearFilter: React.FC<SingleYearFilterProps> = ({
  data,
  loading,
  value,
  onChange,
}: SingleYearFilterProps) => {
  const [additionalYear, setAdditionalYear] = useState<number>(null);

  const handleSearch: SelectProps['onSearch'] = useCallback(
    (searchTerm) => {
      if (!isFinite(toNumber(searchTerm)) || toNumber(searchTerm) <= data[0]) {
        return;
      }

      const existsMatch = data.some((year) => `${year}`.includes(searchTerm));
      if (!existsMatch) {
        setAdditionalYear(toNumber(searchTerm));
      }
    },
    [data],
  );

  const handleChange: SelectProps['onChange'] = useCallback(
    (selected) => onChange(selected.value as number),
    [onChange],
  );

  const options: SelectOptions = useMemo(() => {
    const result = [...data];
    if (additionalYear) result.push(additionalYear);
    return result.map((year) => ({
      label: year.toString(),
      value: year,
    }));
  }, [data, additionalYear]);

  const currentValue = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  return (
    <Select
      loading={loading}
      current={currentValue}
      options={options}
      showSearch
      onChange={handleChange}
      onSearch={handleSearch}
    />
  );
};

export default SingleYearFilter;
