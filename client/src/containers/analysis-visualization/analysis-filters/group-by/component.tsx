import { useCallback, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilter } from 'store/features/analysis/filters';
import Select from 'components/select';

import type { SelectOption, SelectProps } from 'components/select/types';
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
  {
    id: 'location-type',
    name: 'Location type',
  },
];

const GroupByFilter: React.FC = () => {
  const filters = useAppSelector(analysisFilters);
  const dispatch = useAppDispatch();

  const handleChange: SelectProps['onChange'] = useCallback(
    ({ value }) => {
      dispatch(
        setFilter({
          id: 'by',
          value,
        }),
      );
    },
    [dispatch],
  );

  const options: SelectProps['options'] = useMemo(
    () =>
      GROUP_BY_OPTIONS.map(({ id, name }) => ({
        label: name,
        value: id,
      })),
    [],
  );

  const currentValue: SelectOption = useMemo(
    () => (options as SelectOption[]).find((group) => group.value === filters.by),
    [filters.by, options],
  );

  return <Select label="by" current={currentValue} options={options} onChange={handleChange} />;
};

export default GroupByFilter;
