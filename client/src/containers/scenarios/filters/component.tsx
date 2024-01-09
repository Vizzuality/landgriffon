import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'rooks';
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
  const handleSearchByTerm = useDebounce((value) => dispatch(setSearchTerm(value)), 250);

  const currentSort = useMemo(() => SORT_OPTIONS.find(({ value }) => value === sort), [sort]);

  return (
    <div className="flex items-center justify-between space-x-4 ">
      <Search
        placeholder="Search"
        defaultValue={searchTerm}
        onChange={handleSearchByTerm}
        size="sm"
      />
      <Select
        value={currentSort}
        options={SORT_OPTIONS}
        onChange={handleSort}
        icon={<SortDescendingIcon className="h-4 w-4" />}
        disabled
      />
    </div>
  );
};

export default ScenariosFilters;
