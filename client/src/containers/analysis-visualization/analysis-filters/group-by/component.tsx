import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilter } from 'store/features/analysis/filters';
import Select from 'components/forms/select';

import type { Option, SelectProps } from 'components/forms/select/types';
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
  const { replace, query = {} } = useRouter();
  const dispatch = useAppDispatch();
  const filters = useAppSelector(analysisFilters);

  const options: SelectProps['options'] = useMemo(
    () =>
      GROUP_BY_OPTIONS.map(({ id, name }) => ({
        label: name,
        value: id,
      })),
    [],
  );

  const currentValue: Option = useMemo(
    () => options.find((option) => option.value === query.by) || options[0],
    [query.by, options],
  );

  const handleChange: SelectProps['onChange'] = useCallback(
    ({ value }: Option<string>) => {
      replace({ query: { ...query, by: value } }, undefined, {
        shallow: true,
      });
    },
    [query, replace],
  );

  useEffect(() => {
    if (currentValue?.value !== filters.by) {
      dispatch(
        setFilter({
          id: 'by',
          value: currentValue?.value,
        }),
      );
    }
  }, [dispatch, currentValue, filters.by]);

  return (
    <div className="w-[168px]">
      <Select
        icon={<span className="text-sm text-gray-400">by</span>}
        value={currentValue}
        options={options}
        onChange={handleChange}
        data-testid="group-filters"
      />
    </div>
  );
};

export default GroupByFilter;
