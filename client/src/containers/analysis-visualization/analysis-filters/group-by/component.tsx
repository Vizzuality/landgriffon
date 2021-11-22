import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

import Select from 'components/select';
// import { ChevronDownIcon } from '@heroicons/react/solid';

import type { Group } from 'types';

const GROUP_BY_OPTIONS: Group[] = [
  {
    id: 'material',
    name: 'Material',
  },
  {
    id: 'business-unit',
    name: 'Business Unit',
  },
  {
    id: 'region',
    name: 'Region',
  },
  {
    id: 'supplier',
    name: 'Supplier',
  },
];

const GroupByFilter: React.FC = () => {
  const { filters } = useAppSelector(analysis);
  const dispatch = useAppDispatch();

  const handleChange = useCallback(
    (value) => {
      dispatch(
        setFilter({
          id: 'by',
          value,
        }),
      );
    },
    [dispatch],
  );

  const options = GROUP_BY_OPTIONS.map(({ id, name }) => ({
    label: name,
    value: id,
  }));
  const currentValue = options.find((group) => group.value === filters.by);

  return (
    <Select
      label="by"
      current={currentValue}
      options={options}
      onChange={handleChange}
      // className="w-40"
      // optionLabelProp="label"
      // suffixIcon={<ChevronDownIcon />}
    />
  );
};

export default GroupByFilter;
