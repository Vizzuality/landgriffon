import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

import { Select } from 'antd';
import { ChevronDownIcon } from '@heroicons/react/solid';

import type { Group } from 'types';

const ALL_GROUPS: Group[] = [
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

type GroupByFilterProps = {};

const GroupByFilter: React.FC<GroupByFilterProps> = () => {
  const { filters } = useAppSelector(analysis);
  const dispatch = useAppDispatch();

  const handleChange = useCallback((value) => {
    dispatch(
      setFilter({
        id: 'by',
        value,
      })
    );
  }, []);

  return (
    <Select
      value={filters.by}
      onChange={handleChange}
      className="w-40"
      optionLabelProp="label"
      suffixIcon={<ChevronDownIcon />}
    >
      {ALL_GROUPS.map((group) => (
        <Select.Option
          key={group.id}
          value={group.id}
          label={
            <>
              <span className="text-gray-500">by</span> {group.name}
            </>
          }
        >
          {group.name}
        </Select.Option>
      ))}
    </Select>
  );
};

export default GroupByFilter;
