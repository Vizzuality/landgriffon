import { FC, Fragment, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { SearchIcon } from '@heroicons/react/solid';
import { Transition } from '@headlessui/react';
import { useDebounce } from '@react-hook/debounce';

import classNames from 'classnames';
import Select from 'components/select';
import { useAppSelector } from 'store/hooks';
import { scenarios, setScenarioFilter } from 'store/features/analysis/scenarios';
import { useDispatch } from 'react-redux';

const SORT_OPTIONS = [
  {
    label: 'Recent',
    value: 'updatedAt',
  },
  {
    label: 'Title',
    value: 'title',
  },
];

const filtersItems = [
  // {
  //   name: 'All',
  //   filter: 'all',
  // },
  // {
  //   name: 'My scenarios',
  //   filter: 'private',
  // },
  // {
  //   name: 'Shared',
  //   filter: 'public',
  // }, // TO DO - change hen API is ready
];

const ScenariosFilters: FC = () => {
  const dispatch = useDispatch();
  const handleFilter = useCallback((value) => dispatch(setScenarioFilter(value)), [dispatch]);

  const router = useRouter();

  const { query } = router;
  const [isSearchEnable, setSearchEnable] = useState(false);
  const { filter } = useAppSelector(scenarios);
  const [term, setTerm] = useDebounce(null, 250); // wait 250ms before set term
  const toggleSearch = useCallback(() => setSearchEnable(!isSearchEnable), [isSearchEnable]);
  const handleSort = useCallback(
    (selected) =>
      router.replace({
        pathname: '/analysis',
        query: {
          ...query,
          sortBy: selected.value,
        },
      }),
    [],
  );

  const handleSearchByTerm = useCallback((event) => setTerm(event.currentTarget.value), []);

  useEffect(() => {
    if (term) {
      router.replace({
        pathname: '/analysis',
        query: {
          ...query,
          term,
        },
      });
    }
  }, [term]);

  return (
    <div className="flex items-center">
      <div className="relative flex">
        <button type="button" onClick={toggleSearch} className="realtive">
          <SearchIcon className="w-4 h-4" />
        </button>
        {isSearchEnable && (
          <Transition
            as={Fragment}
            enter="transition-opacity ease-linear duration-700"
            enterFrom="-left-10"
            enterTo="left-0"
            leave="transition-opacity ease-linear duration-700"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <input
              id="search"
              name="search"
              placeholder="Search"
              className="flex-1 appearance-none text-sm text-green-700 font-bold border-0 border-b-2 border-green-700 px-0 py-0 focus:outline-none focus:border-green-700 focus:ring-0 max-w-[86px]"
              type="search"
              onChange={handleSearchByTerm}
            />
          </Transition>
        )}
      </div>

      <ul className="relative flex flex-1 space-x-2 ml-3 justify-start whitespace-nowrap items-center">
        {filtersItems.map((item) => (
          <li key={item.filter}>
            <button
              className={classNames(
                'block',
                filter === item.filter
                  ? 'border-b-2 border-green-700 box-content text-gray-900'
                  : 'text-gray-500',
              )}
              onClick={() => handleFilter(item.filter)}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="absolute right-0 bg-white z-10 pl-5">
        <Select
          theme="default-bordernone"
          current={SORT_OPTIONS[0]}
          options={SORT_OPTIONS}
          onChange={handleSort}
        />
      </div>
    </div>
  );
};

export default ScenariosFilters;
