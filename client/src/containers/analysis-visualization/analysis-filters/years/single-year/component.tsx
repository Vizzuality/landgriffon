import React, { useCallback, useMemo } from 'react';

import Select from 'components/select';

import type { SelectOption, SelectOptions, SelectProps } from 'components/select/types';
import type { SingleYearFilterProps } from './types';

const SingleYearFilter: React.FC<SingleYearFilterProps> = ({
  data,
  loading,
  value,
  onChange,
  onSearch,
}: SingleYearFilterProps) => {
  const handleChange: SelectProps['onChange'] = useCallback(
    (selected) => onChange(selected.value as number),
    [onChange],
  );

  const options: SelectOptions = useMemo(
    () =>
      data?.map((year) => ({
        label: year.toString(),
        value: year,
      })),
    [data],
  );

  const currentValue: SelectOption = useMemo(
    () => options?.find((option) => option.value === value),
    [options, value],
  );

  return (
    <Select
      loading={loading}
      current={currentValue}
      options={options}
      showSearch
      onChange={handleChange}
      onSearch={onSearch}
    />
  );
};

export default SingleYearFilter;
