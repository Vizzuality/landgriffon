import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounceCallback } from '@react-hook/debounce';
import { SortDescendingIcon } from '@heroicons/react/solid';

import { useAppSelector } from 'store/hooks';
import { scenarios, setSort, setSearchTerm } from 'store/features/analysis/scenarios';
import Select from 'components/forms/select';
import Search from 'components/search';

import type { FC } from 'react';

const SORT_OPTIONS = [
  {
    label: 'Recent',
    value: '-updatedAt',
  },
  {
    label: 'Title',
    value: 'title',
  },
];

const ScenariosFilters: FC = () => {
  const dispatch = useDispatch();
  const { searchTerm, sort } = useAppSelector(scenarios);

  const handleSort = useCallback((selected) => dispatch(setSort(selected.value)), [dispatch]);
  const handleSearchByTerm = useDebounceCallback((value) => dispatch(setSearchTerm(value)), 250);

  const currentSort = useMemo(() => SORT_OPTIONS.find(({ value }) => value === sort), [sort]);

  return (
    <div className="flex items-center justify-between space-x-4">
      <Search placeholder="Search" defaultValue={searchTerm} onChange={handleSearchByTerm} />
      <Select
        value={currentSort}
        options={SORT_OPTIONS}
        onChange={handleSort}
        icon={<SortDescendingIcon className="w-4 h-4" />}
      />
    </div>
  );
};

export default ScenariosFilters;
