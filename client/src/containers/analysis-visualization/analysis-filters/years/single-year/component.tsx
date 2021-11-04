import React, { useState, useCallback } from 'react';
import { Popover } from '@headlessui/react';
import { Select, SelectProps } from 'antd';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { toNumber, isFinite } from 'lodash';

import { SingleYearFilterProps } from './types';

const SingleYearFilter: React.FC<SingleYearFilterProps> = ({
  data,
  value,
  onChange,
}: SingleYearFilterProps) => {
  const [additionalYear, setAdditionalYear] = useState<number>(null);

  const onSearch: SelectProps<number>['onSearch'] = useCallback(
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

  return (
    <Popover className="relative">
      <Select
        value={value}
        optionLabelProp="label"
        className="w-28"
        suffixIcon={<ChevronDownIcon />}
        showSearch
        onChange={onChange}
        onSearch={onSearch}
      >
        {data.map((year) => (
          <Select.Option
            key={year}
            value={year}
            label={
              <>
                <span className="text-gray-500">in</span> {year}
              </>
            }
          >
            {year}
          </Select.Option>
        ))}
        {additionalYear !== null && (
          <Select.Option
            key={`additional-year-${additionalYear}`}
            value={additionalYear}
            label={
              <>
                <span className="text-gray-500">in</span> {additionalYear}
              </>
            }
          >
            {additionalYear}
          </Select.Option>
        )}
      </Select>
    </Popover>
  );
};

export default SingleYearFilter;
